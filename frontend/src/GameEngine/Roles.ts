// Add an attribute that is a function that is their ability ** 
// Associated UUIDs with usernames at some point

import { IStatusCondition } from "./StatusConditions";

// Further progress: create a game manager that instantiates this role manager

// Things to consider moving forward: 
// lobby system and how to implement it

// Weighting system based off if a player has PAID TO WIN ! or some other factors ... 
// Maybe levels based on certain roles or even classes


// REALLY FAR DOWN THE LINE: Skill trees or some shit, Skyrim shit idfk


export class Role {
    playerClass : string;
    name : string;
    description: string; 
    abilityActive: boolean;
    playerAlive: boolean;
    timeSinceAbilityUsed: number;
    abilityCD: number; // Number of days until the ability becomes active
    priority: number; // This handles which roles will be taken care of first -- for example, blocking has higher priority than killing
    isDayRole: boolean; // Is the role used during the day or at night? If true then it is a day role, otherwise it is a night role
    isBlocked: boolean;
    action?: string;

    username?: string;

    constructor()
    {
        this.playerClass =  "Undefined"
        this.name = "Default name";
        this.description = "Default description";
        this.abilityActive = false;
        this.playerAlive = true;
        this.timeSinceAbilityUsed = 0;
        this.abilityCD = 3;
        this.priority = 3;
        this.isDayRole = false;
        this.isBlocked = false;
        this.action = "";

        this.username = "Player";
    }    

    public toString = () : string => {
        return `Role (name: ${this.name})`;
    }

}


// Consider adding UUID at some point -- in addition to unique usernames
export class Player {
    username: string;
    role: Role;
    statusConditions: Set<IStatusCondition>;
    
    constructor(specifiedUsername?: string | undefined)
    {
        if (specifiedUsername) {
            this.username = specifiedUsername;
        }
        else {
            // Add functionality for getting the username for a given player here
            this.username = "";
        }
        this.statusConditions = new Set();
        this.role = new Role();
    }
    
    public toString = () : string => {
        return `Player (id: ${this.username})`;
    }

    public addStatusCondition = (status: IStatusCondition) => {
        this.statusConditions.add(status);
    }

}

export class RoleManager{
    managedRoles = new Map<string, Role>();
    currentlyAssignedRoles: Role[] = new Array();
    minRoles = 6;
    maxRoles = 12;

    // Noble Roles
    king: Role = {playerClass: "Noble", name: "King", description: "Has the ability to execute one player every three rounds.",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 3, priority: 1, isDayRole: true, isBlocked: false}

    lordMagician: Role = {playerClass: "Noble", name: "Lord Magician", 
    description: "Has the ability to spellblock (stop a player from using their role) every two turns",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 3, priority: 1, isDayRole: false, isBlocked: false};

    knight: Role = {playerClass: "Noble", name: "Knight", 
    description: "Has the ability to protect a player from death. Protection can not be used on the same player twice.",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 2, priority: 2, isDayRole: false, isBlocked: false};

    chancellor: Role = {playerClass: "Noble", name: "Chancellor",
    description: "Has the ability to steal a player's vote.",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 3, priority: 2, isDayRole: true, isBlocked: false};

    inquisitor: Role = {playerClass: "Noble", name: "Inquisitor",
    description: "Has the ability to kill any player but this will be broadcasted after the fact",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 3, priority: 1, isDayRole: false, isBlocked: false};

    apothecarist: Role = {playerClass: "Noble", name: "Apothecarist",
    description: "Has the ability to poison a player which will cause them to die in three days.",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 3, priority: 1, isDayRole: false, isBlocked: false};


    // Noble Peasant Roles
    drunk: Role = {playerClass: "NoblePeasant", name: "Drunk", 
    description: "Has the ability to choose one player which they can watch for a night. They will uncover any interactions this player has with any other player",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 2, priority: 2, isDayRole: false, isBlocked: false};

    medic: Role = {playerClass: "NoblePeasant", name: "Medic",
    description: "Has the ability to stop the poisoning of a player.",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 2, priority: 2, isDayRole: false, isBlocked: false};

    vigilante : Role = {playerClass: "NoblePeasant", name: "Vigiilante",
    description: "Has the ability to kill a player but if they kill a non-revolutionary they will kill themselves in the next round",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 2, priority: 1, isDayRole: false, isBlocked: false};

    // Revolutionary Peasant Roles
    assassin: Role = {playerClass: "RevolutionaryPeasant", name: "Assasin", 
    description: "Has the ability to kill one player every three nights",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 3, priority: 1, isDayRole: false, isBlocked: false};

    poisoner: Role = {playerClass: "RevolutionaryPeasant", name: "Poisoner", 
    description: "Has the ability to poison a player causing them to die in three days.",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 3, priority: 1, isDayRole: false, isBlocked: false};

    propogandist: Role = {playerClass: "RevolutionaryPeasant", name: "Propogandist",
    description: "Has the ability to turn a noble peasant into a revolutionary peasant. If they attempt to recruit a noble they will be killed.",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 2, priority: 2, isDayRole: true, isBlocked: false};


    queueForRoles: Role[] = new Array(this.king, this.drunk, this.assassin, this.lordMagician, this.poisoner, this.propogandist,
        this.medic, this.vigilante, this.inquisitor, this.apothecarist);


    // Returns a role that is currently unoccupied that can then be associated with a player
    // in the mangedRoles dictionary.
    getEmptyRole() : Role | null
    {
        // If the queue is unempty then get the first item in the queue -- this helps to maintain
        // priority for certain roles over others, for instance, a game should have a king before it has a town drunk.
        if(this.queueForRoles.length !== 0)
        {
            // Hold the value of the noble role
            const role: Role = this.queueForRoles[0];

            this.queueForRoles.shift(); // Pop an item from the front of the queue

            this.currentlyAssignedRoles.push(role); // Add it to the list of currently assigned roles.

            return role;
        }
    
        // If there is no more roles to assign then return null for the role.
        return null; 
    }

    // Adds a key, value pair for a given player role interaction within the managedRoles dictionary
    // @param username: the username for a given player that we will now associate with a role.
    addRolePlayerEntry(username: string)
    {
        const roleForPlayer = this.getEmptyRole();

        if(roleForPlayer === null)
        {
            return console.log("No available roles");
        }
        
        this.managedRoles.set(username, roleForPlayer);

    }

    deleteRolePlayerEntry(username: string)
    {
        const roleToBeDeleted = this.managedRoles.get(username);
        console.log("Role to be deleted", roleToBeDeleted);

        this.managedRoles.delete(username);

        const indexToRemove = this.currentlyAssignedRoles.findIndex(role => role == roleToBeDeleted);
        
        delete this.currentlyAssignedRoles[indexToRemove];
    }

    // Returns the roles that have currently been assigned to players.
    // Primarily for debug purposes.
    printCurrentlyAssignedRoles()
    {
        this.currentlyAssignedRoles.forEach(function (role) { console.log(role)})
        console.log(this.managedRoles);
    }

    // Set abilities to active if they have waited the amount of days necessary
    setAbilitiesToActive()
    {
        for(let player of this.currentlyAssignedRoles)
        {
            if(player.abilityCD <= player.timeSinceAbilityUsed)
            {
                player.abilityActive = true;
            }
        }
    }

    // Get the role associated with a given username
    getRoleFromUsername(username: string) 
    {
        return this.managedRoles.get(username);
    }

    isPlayerBlocked(username: string)
    {
        const roleForPlayer = this.getRoleFromUsername(username);

        if(roleForPlayer != undefined)
        {
            return (roleForPlayer.isBlocked);
        }

        return undefined;
    }

    isPlayerAlive(username: string)
    {
        const roleForPlayer = this.getRoleFromUsername(username);

        if(roleForPlayer != undefined)
        {
            return (roleForPlayer.playerAlive);
        }

        return undefined;
    }

    blockAbility(blockerUsername: string, blockedUsername: string)
    {
        if(this.isPlayerBlocked(blockerUsername) == false) // If the player blocking is not blocked then they can perform their action
        {

            if(this.managedRoles.get(blockedUsername) != undefined)
            {
                // Set the associated username to blocked
                (this.managedRoles.get(blockedUsername) as Role).isBlocked  = true;

            }

        }
    }

    playerKill(killerUsername: string, killedUsername: string)
    {
        if(this.isPlayerBlocked(killerUsername) == false)
        {
            if(this.managedRoles.get(killedUsername) != undefined)
            {
                // Set the playerAlive variable to false
                (this.managedRoles.get(killedUsername) as Role).playerAlive = false;
            }
        }
    }

    numberOfPlayersAlive() : number
    {
        let numberOfAlivePlayers: number = 0;

        for(let player of this.currentlyAssignedRoles)
        {
            if(player.playerAlive == true)
            {
                numberOfAlivePlayers += 1;
            }
        }

        return numberOfAlivePlayers;
    }

    // Goes through each of the players and updates their ability CDs and whether their ability is active or not
    updatePlayerAbilites()
    {
        for(let player of this.currentlyAssignedRoles)
        {
            if(player.abilityActive == false)
            {
                player.abilityCD -= 1;
            }

            if(player.abilityCD == 0)
            {
                player.abilityActive = true;
            }
        }
    }



}



