import * as React from 'react';
import { Role } from '../GameEngine/Roles';
import "./GamePageStyles.css"
import { Column, ProfilePicArea, UserAlignmentLabel, UserClassLabel, UserNameLabel } from './GameStyledComponents';

interface UserInfoSectionProps {
  user: Role | undefined;
}

export const UserInfoSection = (props: UserInfoSectionProps) => {
  const getProfilePicPath = () => {
    if (props.user)
      if (props.user.name === "King")
        return "king.png";
      else if (props.user.name === "Assassin")
        return "assassin.png";
      else if (props.user.name === "Apothecary" || props.user.name === "Chancellor" || props.user.name === "Drunk" || props.user.name === "Inquisitor" || props.user.name === "Knight" || props.user.name === "Magician" || props.user.name === "Medic" || props.user.name === "Poisoner" || props.user.name === "Propagandist" || props.user.name === "Vigilante")
        return props.user.name + ".png";
      else if (props.user.name === "Street Rat")
        return "Streetrat.png";

    return "anonymous.png";
  }

  return (
    <Column style={{ alignItems: "center", justifyContent: "flex-start" }}>
      <ProfilePicArea><img src={getProfilePicPath()} style={{ width: "100%", height: "100%" }} /></ProfilePicArea>
      <UserNameLabel>{props.user ? props.user.username : "Player"}</UserNameLabel>
      <UserAlignmentLabel>{props.user ? props.user.playerClass : "Alignment"}</UserAlignmentLabel>
      <UserClassLabel>{props.user ? props.user.name : "Class"}</UserClassLabel>
      {/* {
        Array.from(props.user.statusConditions).map((condition, index) => {
          return (
            <StatusConditionTag key={index} theme={{bg: condition.bgColor}}>
              {condition.name}
            </StatusConditionTag>);
        })
      } */}
    </Column>
  )
}

export default UserInfoSection;