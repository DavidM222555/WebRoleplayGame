import * as React from 'react';
import "./GamePageStyles.css"
import { ActionsHeader, ActionTag, Column } from './GameStyledComponents';

export interface IAction {
  name: string;
  bgColor: string;
  action: () => void;
}

interface IActionSectionProps {
  actions: IAction[];
  passTurn: () => void;
}

export const ActionSection = (props: IActionSectionProps) => {
  return (
    <Column style={{ justifyContent: "flex-start" }}>
      <ActionsHeader>Actions</ActionsHeader>
      {
        props.actions.map((actn, index) => {
          return (
            <ActionTag
              key={index} 
              theme={{bg: actn.bgColor}}
              onClick={() => actn.action()}
            >
              {actn.name}
            </ActionTag>);
        })
      }
      <ActionTag
        theme={{bg: "beige"}}
        onClick={() => props.passTurn()}
      >
        wait
      </ActionTag>
    </Column>
  )
}

export default ActionSection;