import * as React from 'react';
import "./GamePageStyles.css"
import { Dialog } from '@mui/material';
import { ChatEnterDiv, ChatInputAreaDiv, ChatInputDiv, ChatMessageArea, Column, VotePromptDialogArea, VotingPromptText } from './GameStyledComponents';
import { useState } from 'react';

interface NotesDialogProps {
    open: boolean;
    closeNotes: () => void;
}

export const NotesDialog = (props: NotesDialogProps) => {
  const [notes, setNotes] = useState<string[]>([]);
  const [msgInput, setMsgInput] = useState<string>("");

  return (
    <div>
      <Dialog
        open={props.open}
        onBackdropClick={props.closeNotes}
      >
        <VotePromptDialogArea>
          <Column>
            <VotingPromptText>Scribe's Notes</VotingPromptText>
            <ChatMessageArea className="unrounded-border">
              {
                notes.map((note) => {
                  return (
                    <div>{note}</div>
                  );
                })
              }
            </ChatMessageArea>
            <br />
            <ChatInputAreaDiv>
              <Column>
                <ChatInputDiv>
                  <input 
                    className="chat-textarea"
                    type="text"
                    value={msgInput}
                    onChange={(event) => setMsgInput(event.target.value)}
                    placeholder="Enter notes"
                  />
                </ChatInputDiv>
                <ChatEnterDiv>
                  <button 
                    className="chat-submit-button"
                    style={{
                      width: "100px"
                    }}
                    onClick={() => {
                      if (msgInput.trim() !== "") {
                        const newNotes = notes;
                        newNotes.push(msgInput);

                        setNotes(newNotes);
                        setMsgInput("");
                      }
                    }}
                  >Enscribe</button>
                </ChatEnterDiv>
              </Column>
            </ChatInputAreaDiv>
          </Column>
        </VotePromptDialogArea>
      </Dialog>
    </div>
  )
}

export default NotesDialog;