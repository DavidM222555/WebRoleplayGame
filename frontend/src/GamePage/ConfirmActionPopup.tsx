import * as React from 'react';
import "./GamePageStyles.css"
import { Role } from '../GameEngine/Roles';
import { Button, Dialog } from '@mui/material';
import { Column, VotePromptDialogArea, VotingPromptText } from './GameStyledComponents';

interface ConfirmActionPopupProps {
    showPopup: boolean;
    playerRole: Role | null;
    confirmAction: () => void;
    cancelAction: () => void;
}

export const ConfirmActionPopup = (props: ConfirmActionPopupProps) => {
  return (
    <div>
      <Dialog
        open={props.showPopup}
      >
        <VotePromptDialogArea>
          <Column>
            <VotingPromptText>Are you sure you want to kill {props.playerRole ? props.playerRole.username : null}?</VotingPromptText>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    height: "100",
                    justifyContent: "flex-end"
                }}
            >
                <Button
                    style={{
                        marginTop: "1%",
                        marginRight: "2%"
                    }}
                    variant="contained"
                    color="error"
                    onClick={() => props.cancelAction()}
                >
                    Cancel
                </Button>
                <Button
                    style={{
                        marginTop: "1%"
                    }}
                    variant="contained"
                    color="primary"
                    onClick={() => props.confirmAction()}
                >
                    Confirm 
                </Button>
            </div>
          </Column>
        </VotePromptDialogArea>
      </Dialog>
    </div>
  )
}

export default ConfirmActionPopup;