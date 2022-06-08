import * as Roles from "./Roles"


export class Action {
    sender: string; // Username for the player sending an actoin
    senderRole: string ; 
    receiver: string; // Username for the player receiving an action
    receiverRole: string;
    typeOfAction: string; // Type of action: currently 'blocking', 'killing', and 'poisoning' are the valid actions in the game
    priority: number;

    constructor()
    {
        this.sender = "";
        this.senderRole = "";
        this.receiver = "";
        this.receiverRole = "";
        this.typeOfAction = "";
        this.priority = 0;
    }

}

// Stores information about a given day. This will effectively act as a game state that can be recovered from if the game is interrupted.
export class Day 
{
    DayIndex: number | undefined; // What number day are we on.
    performedActions: Action []; // Array of actions that are pushed to by the game object
    votesForDay: Vote [];

    constructor()
    {
        this.performedActions = [];
        this.votesForDay = [];
    }
}

export function addActionToDay(day: Day, action: Action) : void
{
    day.performedActions.push(action);
}


// Append a vote object to the day
export function addVote(day: Day, vote: Vote) : void
{
    day.votesForDay.push(vote);
}

// Returns the username of the player with the most votes and the vote count they had
export function getMajorityVote(day: Day) : [string, number]
{
    let votesForPlayers = new Map<string, number>();

    for(let vote of day.votesForDay)
    {
        if(votesForPlayers.has(vote.playerVotedAgainst))
        {
            let currentVotes = (votesForPlayers.get(vote.playerVotedAgainst) as  number);

            votesForPlayers.set(vote.playerVotedAgainst, currentVotes + 1)
        }
        else
        {
            votesForPlayers.set(vote.playerVotedAgainst, 1);
        }
    }

    let userWithCurrentMajority = ""; // Holds the user with the majority of the votes
    let highestVote = -1;

    for(let [username, voteCount] of votesForPlayers)
    {
        if(voteCount > highestVote)
        {
            userWithCurrentMajority = username;
            highestVote = voteCount;
        }
    }

    return [userWithCurrentMajority, highestVote];
}


export class Vote
{
    playerVoting: string; // The player casting the vote
    playerVotedAgainst: string; // The player that is being voted against, can potentially be none

    constructor(voterUsername: string, votedAgainst: string | undefined)
    {
        if(votedAgainst == undefined)
        {
            this.playerVoting = voterUsername;
            this.playerVotedAgainst = "";
        }
        else
        {
            this.playerVoting = voterUsername;
            this.playerVotedAgainst = votedAgainst;
        }
    }

}

export class Game
{
    roleManager: Roles.RoleManager;
    gameID : string;
    status: string;
    daysPassed: number;
    isDay: boolean; // Used for differentiating night from day
    currentDay: Day;
    arrayOfDays: Day[]; // Contains all days that have passed in the game state. 
    
    currentPhaseOfTheGame: string; // Current phase the game is in -- valid types are "Start", "Discussion", "Voting", "Night", "End"

    constructor()
    {
        this.roleManager = new Roles.RoleManager();

        this.gameID = "";
        this.status = "";
        this.daysPassed = 0;
        this.isDay = true; // Begin during the daytime. This will update when the timer is set to zero and we enter night

        this.currentDay = {performedActions: [], votesForDay: [], DayIndex: 0};
        this.arrayOfDays = [];
        this.currentPhaseOfTheGame = "";
    }


    // Begins the 'day' part of the game. 
    // Initialize a new Day object and associate the game.currentDay object to be this new day
    startUpkeep()
    {
        // Create a day object and push to the array of days
        let newDay: Day = {DayIndex: this.daysPassed, votesForDay: [], performedActions: []}

        this.currentDay = newDay; // Change the current day to be this new day object we have created
        this.currentPhaseOfTheGame = "Start";

        setTimeout(() => {this.discussionPhase();}, 1000);

    }

    discussionPhase()
    {
        // Begin in the discussion phase -- this will probably last around
        // 30 seconds or so. Once this is over we go into the voting phase

        let secondsForDiscussion = 15;
        this.currentPhaseOfTheGame = "Discussion";

        setTimeout(() => {this.votePhase();}, secondsForDiscussion*1000);

        // Query for day role actions here and perform them or store them depending on which role they are for
    }

    votePhase()
    {
        // We are now in the voting phase which will last around 30 seconds as well
        let secondsForVoting = 15;
        this.currentPhaseOfTheGame = "Voting";

        console.log("In voting phase")

        // After the voting phase has ended we go to the night phase
        setTimeout(() => {this.nightPhase();}, secondsForVoting*1000);

        // Handle voting here -- we have an array object associated for votes that we can push to
        let majorityVote = getMajorityVote(this.currentDay);

        if(majorityVote[1]/this.roleManager?.numberOfPlayersAlive() > 0.50) // Is it a majority vote?
        {
            // Kill the player
            (this.roleManager.getRoleFromUsername(majorityVote[0]) as Roles.Role).playerAlive = false;

        }

        // Query for day role actions here and perform them or store them depending on which role they are for

    }

    nightPhase()
    {
        let secondsForNight = 15;
        this.currentPhaseOfTheGame = "Night";

        console.log("In night phase");

        setTimeout(() => {this.endUpkeep();}, secondsForNight*1000);

        // Query for night role actions here and store them for later priority checking.
    }

    // Updates the number of days that have passed and also pushes the currentDay object to the arrayOfDays
    endUpkeep()
    {
        this.currentPhaseOfTheGame = "End";

        // Go through and perform the actions that are stored in the performed actions array
        // Begin by sorting the actions based on priority level
        let sortedActions = this.currentDay.performedActions.sort((a,b) => (a.priority > b.priority ? -1 : 1));

        // Handle the actions here sorted by priority
        for(let action of sortedActions)
        {
            // First we need to make sure the sender is not blocked and/or killed
            if(this.roleManager?.isPlayerBlocked(action.sender) != false && this.roleManager?.isPlayerAlive(action.sender) == true)
            {
                if(action.typeOfAction == "kill")
                {
                    this.roleManager.playerKill(action.sender, action.receiver);
                }
                else if(action.typeOfAction == "block")
                {
                    this.roleManager.blockAbility(action.sender, action.receiver);
                }
            }
        }

        // Update the abilities of each of the players
        this.roleManager.updatePlayerAbilites();

        this.daysPassed += 1; // Increment the number of days that have passed
        this.arrayOfDays.push(this.currentDay); // Push the current day object

        setTimeout(() => {this.startUpkeep();}, 1000);
    }

    // Return the phase the game is currently in
    getPhase()
    {
        return this.currentPhaseOfTheGame;
    }

}
