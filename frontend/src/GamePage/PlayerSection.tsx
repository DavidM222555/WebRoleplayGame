import * as React from 'react';
import { Role } from '../GameEngine/Roles';
import "./GamePageStyles.css"
import { Column, PlayerScrollSection, PlayerSectionHeader, PlayerSectionPlayer, PlayerSectionUsername, PlayerSectionUserPicArea } from './GameStyledComponents';

interface IPlayerSectionProps {
  playerRoles: Role[];
  targetPlayerMode: boolean;
  setTargetedPlayer: (player: Role) => void;
}

export const PlayerSection = (props: IPlayerSectionProps) => {
  return (
    <Column>
      <PlayerSectionHeader>Players</PlayerSectionHeader>
      <PlayerScrollSection>
        {
          props.playerRoles.map((player, index) => {
            return (
              <PlayerSectionPlayer key={index} onClick={() => {
                if (props.targetPlayerMode) {
                  props.setTargetedPlayer(player);
                }
              }}>
                <PlayerSectionUserPicArea>
                  <img src={player.playerAlive ? "anonymous.png" : "anonymous_dead.png"} style={{ width: "100%", height: "100%"}} />
                </PlayerSectionUserPicArea>
                <PlayerSectionUsername>{player.username}</PlayerSectionUsername>
              </PlayerSectionPlayer>
            );
          })
        }
      </PlayerScrollSection>
    </Column>
  )
}

export default PlayerSection;