import * as React from 'react';
import "./GamePageStyles.css"
import { Role } from '../GameEngine/Roles';
import { Button, Dialog } from '@mui/material';
import { Column, VotedConfirmation, VoteDialogPlayerScrollSection, VoteDialogPlayerSectionPlayer, VoteDialogPlayerSectionUsername, VoteDialogPlayerSectionUserPicArea, VoteDialogSelectedPlayer, VotePromptDialogArea, VotingPromptText } from './GameStyledComponents';
import { useState } from 'react';

interface VoteDialogProps {
    voting: boolean;
    playerRoles: Role[];
    castVote: (player: Role) => void;
    voted: boolean;
}

export const VoteDialog = (props: VoteDialogProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Role | null>(null);

  return (
    <div>
      <Dialog
        open={props.voting}
      >
        <VotePromptDialogArea>
          {props.voted ?
            <VotedConfirmation>Your vote has been cast!</VotedConfirmation>
          :
            <Column>
              <VotingPromptText>Cast your vote for public execution!</VotingPromptText>
              <VoteDialogPlayerScrollSection>
                {
                  props.playerRoles.map((player, index) => {
                    if (selectedPlayer === player) {
                      return (
                        <VoteDialogSelectedPlayer key={index} onClick={() => {
                          setSelectedPlayer(null);
                        }}>
                            <VoteDialogPlayerSectionUserPicArea />
                            <VoteDialogPlayerSectionUsername>{player.username}</VoteDialogPlayerSectionUsername>
                        </VoteDialogSelectedPlayer>
                        );
                    }
                      return (
                      <VoteDialogPlayerSectionPlayer key={index} onClick={() => {
                        setSelectedPlayer(player);
                      }}>
                          <VoteDialogPlayerSectionUserPicArea />
                          <VoteDialogPlayerSectionUsername>{player.username}</VoteDialogPlayerSectionUsername>
                      </VoteDialogPlayerSectionPlayer>
                      );
                  })
                }
              </VoteDialogPlayerScrollSection>
              <Button
                style={{
                  marginTop: "3%"
                }}
                variant="contained"
                color="error"
                onClick={() => {
                  if (selectedPlayer !== null) {
                    props.castVote(selectedPlayer)
                  }
                }}
              >
                Cast Vote
              </Button>
            </Column>
          }
        </VotePromptDialogArea>
      </Dialog>
    </div>
  )
}

export default VoteDialog;