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
    isPoisoned: boolean;
    timePoisoned: number;
    faction: string;
    isImmune: boolean; 
    action: string; // Description of the action -- currently we have "block", "kill", "immune", "convert", "poison", and "heal"

    // may want to remove this, I'm adding for convenience
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
        this.isPoisoned = false;
        this.timePoisoned = 0; // After three days of being poisoned a player will die -- they can however be healed which resets their poison counter
        this.isImmune = false;
        this.action = "";

        this.faction = "";
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
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 3,
    priority: 1, isDayRole: true, isBlocked: false, isPoisoned: false, timePoisoned: 0, faction: "Noble", isImmune: false, action: "kill"}

    lordMagician: Role = {playerClass: "Noble", name: "Lord Magician", 
    description: "Has the ability to spellblock (stop a player from using their role) every two turns",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 3,
    priority: 1, isDayRole: false, isBlocked: false, isPoisoned: false, timePoisoned: 0, faction: "Noble", isImmune: false, action: "block"};

    knight: Role = {playerClass: "Noble", name: "Knight", 
    description: "Has the ability to protect a player from death. Protection can not be used on the same player twice.",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 2,
    priority: 2, isDayRole: false, isBlocked: false, isPoisoned: false, timePoisoned: 0, faction: "Noble", isImmune: false, action: "immune"};

    chancellor: Role = {playerClass: "Noble", name: "Chancellor",
    description: "Has the ability to steal a player's vote.",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 3,
    priority: 2, isDayRole: true, isBlocked: false, isPoisoned: false, timePoisoned: 0, faction: "Noble", isImmune: false, action: ""};

    inquisitor: Role = {playerClass: "Noble", name: "Inquisitor",
    description: "Has the ability to kill any player but this will be broadcasted after the fact",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 3,
    priority: 1, isDayRole: false, isBlocked: false, isPoisoned: false, timePoisoned: 0, faction: "Noble", isImmune: false, action: "kill"};

    apothecarist: Role = {playerClass: "Noble", name: "Apothecarist",
    description: "Has the ability to poison a player which will cause them to die in three days.",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 3,
    priority: 1, isDayRole: false, isBlocked: false, isPoisoned: false, timePoisoned: 0, faction: "Noble", isImmune: false, action: "poison"};


    // Noble Peasant Roles
    drunk: Role = {playerClass: "NoblePeasant", name: "Drunk", 
    description: "Has the ability to choose one player which they can watch for a night. They will uncover any interactions this player has with any other player",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 2,
    priority: 2, isDayRole: false, isBlocked: false, isPoisoned: false, timePoisoned: 0, faction: "NoblePeasant", isImmune: false, action: ""};

    medic: Role = {playerClass: "NoblePeasant", name: "Medic",
    description: "Has the ability to stop the poisoning of a player.",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 2,
    priority: 2, isDayRole: false, isBlocked: false, isPoisoned: false, timePoisoned: 0, faction: "NoblePeasant", isImmune: false, action: "heal"};

    vigilante : Role = {playerClass: "NoblePeasant", name: "Vigiilante",
    description: "Has the ability to kill a player but if they kill a non-revolutionary they will kill themselves in the next round",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 2,
    priority: 1, isDayRole: false, isBlocked: false, isPoisoned: false, timePoisoned: 0, faction: "NoblePeasant", isImmune: false, action: "kill"};

    streetRat : Role = {playerClass: "NoblePeasant", name: "Street Rat",
    description: "Able to escape death once every 5 turns",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 5,
    priority: 1, isDayRole: false, isBlocked: false, isPoisoned: false, timePoisoned: 0, faction: "NoblePeasant", isImmune: false, action: "immune"};


    // Revolutionary Peasant Roles
    assassin: Role = {playerClass: "RevolutionaryPeasant", name: "Assassin", 
    description: "Has the ability to kill one player every three nights",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 3,
    priority: 1, isDayRole: false, isBlocked: false, isPoisoned: false, timePoisoned: 0, faction: "RevolutionaryPeasant", isImmune: false, action: "kill"};

    poisoner: Role = {playerClass: "RevolutionaryPeasant", name: "Poisoner", 
    description: "Has the ability to poison a player causing them to die in three days.",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 3,
    priority: 1, isDayRole: false, isBlocked: false, isPoisoned: false, timePoisoned: 0, faction: "RevolutionaryPeasant", isImmune: false, action: "poison"};

    propogandist: Role = {playerClass: "RevolutionaryPeasant", name: "Propogandist",
    description: "Has the ability to turn a noble peasant into a revolutionary peasant. If they attempt to recruit a noble they will be killed.",
    abilityActive: false, playerAlive: true, timeSinceAbilityUsed: 0, abilityCD: 2,
    priority: 2, isDayRole: true, isBlocked: false, isPoisoned: false, timePoisoned: 0, faction: "RevolutionaryPeasant", isImmune: false, action: "propoganda"};


    queueForRoles: Role[] = new Array(this.king, this.assassin, this.inquisitor, this.drunk, this.lordMagician, this.poisoner, this.propogandist,
        this.medic, this.vigilante, this.apothecarist, this.streetRat);


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

        // Begin by getting an empty role for the user
        const roleForPlayer = this.getEmptyRole();
        
        if(roleForPlayer === null)
            return console.log("No available roles");
        else
            roleForPlayer.username = username;
        
        this.managedRoles.set(username, roleForPlayer);
    }

    // Deletes an entry in the map managedRoles and also removes it from the currently assigned roles
    // This could happen if a player disconnects.
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

    isPlayerPoisoned(username: string)
    {
        const roleForPlayer = this.getRoleFromUsername(username);

        if(roleForPlayer != undefined)
        {
            return (roleForPlayer.isPoisoned);
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
            if(this.managedRoles.get(killedUsername) !== undefined)
            {
                if (this.managedRoles.get(killedUsername)!.isImmune != true) 
                {
                    // Set the playerAlive variable to false
                    (this.managedRoles.get(killedUsername) as Role).playerAlive = false;
                }
            }
        }
    }

    playerPoison(poisonerUsername: string, poisonedUsername: string)
    {
        if(this.isPlayerBlocked(poisonerUsername) == false)
        {
            if(this.managedRoles.get(poisonedUsername) != undefined)
            {
                (this.managedRoles.get(poisonedUsername) as Role).isPoisoned = true;
            }
        }
    }

    // Unpoisons a given player
    playerHeal(healerUsername: string, healedUsername: string)
    {
        if(this.isPlayerBlocked(healerUsername) == false)
        {
            if(this.managedRoles.get(healedUsername) != undefined)
            {
                // Make the player no longed poisoned and remove all days they have been poisoned
                (this.managedRoles.get(healedUsername) as Role).isPoisoned = false;
                (this.managedRoles.get(healedUsername) as Role).timePoisoned = 0;
            }
        }
    }

    // Used for the propogandist role that can effectively change the faction of a given player
    // The major caveat of this is that the propogandist can only change the role of noble peasants, not nobles
    changePlayerFaction(propogandistUsername: string, userToChangeFaction: string)
    {
        if((this.managedRoles.get(propogandistUsername) as Role).isBlocked != false) // Make sure the propogandist isn't blocked
        {
            if((this.managedRoles.get(userToChangeFaction) as Role).faction != "Noble") // Make sure the propogandist isn't targeting a noble
            {
                (this.managedRoles.get(userToChangeFaction) as Role).faction = "RevolutionaryPeasant";
            }
            else // Otherwise the noble will kill the revolutionary peasant
            {
                this.playerKill(userToChangeFaction, propogandistUsername);
            }
        }
    }

    // Role ability for a common street rat that is able to escape death once. Effectively makes them unkillable
    makePlayerImmune(playerGivingImmunity: string, playerWithImmunity: string)
    {
        if(!this.isPlayerBlocked(playerGivingImmunity))
        {
            (this.managedRoles.get(playerWithImmunity) as Role).isImmune = true;
        }
    }


    // Function that cycles through all players that are poisoned and updates the number of days they have been poinsoned
    // If the player has reached the max number of days they will also be killed.
    updatePoisonCounters()
    {
        for(let player of this.currentlyAssignedRoles)
        {
            if(player.isPoisoned)
            {
                player.timePoisoned += 1;
            }            

            if(player.timePoisoned == 3)
            {
                player.playerAlive = false; // Kill the player if they have been poisoned for three days
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

            if(player.isImmune == true)
            {
                player.isImmune = false;
            }
        }
    }


}