import styled from "styled-components";

export const Row = styled.div`
    display: flex;
    flex-direction: row;
    height: 100%;
    justify-content: space-between;
`;

export const Column = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
`;

export const BackgroundDiv = styled.div`
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-size: 100% 100%;
    height: 89%;
    width: 95%;
    margin: 3px;
    padding: 8px;
    position: absolute;
    border-color: black;
    border-style: solid;
    border-width: 2px;
`;

export const ChatPageSection = styled.div`
    width: 40%;
`;

export const GameInfoPageSection = styled.div`
    width: 59%;
`;

export const ChatSectionDiv = styled.div`
    height: 32%;
`;

export const GameActionsInfoSection = styled.div`
    height: 60%;
`;

export const PlayersSectionDiv = styled.div`
    height: 39%;
    background-color: rgba(0, 0, 128, .5);
`;

export const ActionsSectionDiv = styled.div`
    width: 100%;
    height: 84%;
    background-color: rgba(128, 0, 0, .5);
`;

export const ActionsDaySectionDiv = styled.div`
  width: 70%;
`

export const DayIndicatorDiv = styled.div`
  width: 100%;
  height: 12%;
  background-color: rgba(0, 128, 128, .5);
  color: white;
  font-size: 34px;
`;

export const DayIndicatorTag = styled.h1`
  margin-top: 7.5px;
  margin-left: 10px;
  font-size: 34px;
`;

export const UserNotesSectionDiv = styled.div`
    width: 28%;
`;

export const UserInfoSectionDiv = styled.div`
    background-color: rgba(128, 0, 128, .5);
    height: 85%;
`;

export const NotesSectionDiv = styled.div`
    height: 12%;
    background-color: rgba(128, 128, 0, .5);
`;

export const ChatHeader = styled.p`
    color: white;
    margin-top: 0px;
    margin-left: 5px;
    font-size: 28px;
    font-family: PrinceValiant;
`;

export const ChatHeaderArea = styled.div`
    height: 15%;
`;

export const ChatMessageArea = styled.div`
    background-color: rgba(128, 128, 128, .85);
    height: 75%;
    overflow-y: auto;
`;

export const NewsMessageArea = styled.div`
    background-color: rgba(128, 128, 128, .85);
    height: 90%;
    overflow-y: auto;
`;

export const ChatInputAreaDiv = styled.div`
    margin-top: .5%;
    height: 15%;
`;

export const ChatInputDiv = styled.div`
    width: 85%;
`;

export const ChatEnterDiv = styled.div`
    width: 14%;
`;

export const Chat = styled.div`
  margin: 5px 0px;
`;

export const Author = styled.b`
  color: ${props => props.theme.color ? props.theme.color : "black"};
  border: 1px solid ${props => props.theme.color ? props.theme.color : "black"};
  border-radius: 2px;

  background-color: ${props => props.theme.bg ? props.theme.bg : "grey"};

  padding: 1px;
  margin: 5px;

  font-size: medium;
`;

export const Message = styled.p`
  height: fit-content;

  margin: 1px;

  display: inline-block;

  font-size: medium;
`;

export const ProfilePicArea = styled.div`
    background-color: white;
    border-radius: 100px;
    border-width: 3px;
    border-color: black;
    border-style: solid;
    width: 120px;
    height: 120px;
    margin-top: 15px;
`;

export const UserNameLabel = styled.p`
    color: white;
    margin-top: 15px;
    font-size: 30px;
    margin-bottom: 0px;
`;

export const UserAlignmentLabel = styled.p`
    color: white;
    font-size: 18px;
    margin-bottom: 0px;
`;

export const UserClassLabel = styled.p`
    font-size: 24px;
    margin-top: 0px;
    margin-bottom: 5px;
    color: white;
`;

export const StatusConditionTag = styled.div`
  color: "black";
  border-width: 2px;
  border-style: solid;
  border-color: black;
  border-radius: 10px;

  font-size: 22px;
  font-weight: bold;

  background-color: ${props => props.theme.bg ? props.theme.bg : "grey"};

  padding: 5px;
  margin: 10px;
  width: 90%;

  text-align: center;
`;

export const ActionsHeader = styled.p`
  color: white;
  margin-top: 10px;
  margin-left: 10px;
  margin-bottom: 0px;
  font-size: 30px;
`;

export const ActionTag = styled.button`
  color: "black";
  border-width: 2px;
  border-style: solid;
  border-color: black;
  border-radius: 10px;

  font-size: 24px;

  background-color: ${props => props.theme.bg ? props.theme.bg : "grey"};

  padding: 3px;
  margin: 10px;

  text-align: center;

  &:hover {
    background-color: lightblue;
    transform: scale(1.01);
  }
  &:active{
    background-color: white;
  }
`;

export const PlayerSectionHeader = styled.p`
  color: white;
  margin-top: 10px;
  margin-left: 10px;
  margin-bottom: 0px;
  font-size: 30px;
`;

export const PlayerScrollSection = styled.div`
  height: 75%;
  width: 96%;

  margin-left: 18px;
  margin-bottom: 1.5%;

  display: flex;
  flex-direction: row;
  justify-content: flex-start;

  overflow-x: auto;
`;

export const PlayerSectionPlayer = styled.div`
  display: flex;
  flex-direction: column;
  height: 90%;
  justify-content: center;
  margin-right: 28px;
  margin-left: 3px;
  
  &:hover {
    border-radius: 10px;
    border-width: 3px;
    border-color: white;
    border-style: solid;

    margin-right: 25px;
    margin-left: 0px;
`;

export const PlayerSectionUserPicArea = styled.div`
  background-color: white;
  border-radius: 100px;
  border-width: 3px;
  border-color: black;
  border-style: solid;
  width: 100px;
  height: 100px;
`;

export const PlayerSectionUsername = styled.div`
  color: white;
  font-size: 28px;
  text-align: center;
`;

export const VotePromptDialogArea = styled.div`
  padding: 20px;
  background-color: darkgrey;
`;

export const NotePromptDialogArea = styled.div`
  padding: 20px;
  background-color: darkgrey;
  width: 50%;
`;

export const VotingPromptText = styled.p`
  color: black;
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  margin-top: 2%;
`;

export const VoteDialogPlayerScrollSection = styled.div`
  height: 75%;
  width: 96%;

  margin-left: 18px;
  margin-bottom: 1.5%;
  padding-bottom: 1.5%;

  display: flex;
  flex-direction: row;
  justify-content: flex-start;

  overflow-x: auto;
`;

export const VoteDialogPlayerSectionPlayer = styled.div`
  display: flex;
  flex-direction: column;
  height: 95%;
  justify-content: center;
  margin-right: 28px;
  margin-left: 3px;
  
  &:hover {
    border-radius: 10px;
    border-width: 3px;
    border-color: white;
    border-style: solid;

    margin-right: 25px;
    margin-left: 0px;
`;

export const VoteDialogPlayerSectionUserPicArea = styled.div`
  background-color: white;
  border-radius: 100px;
  border-width: 3px;
  border-color: black;
  border-style: solid;
  width: 85px;
  height: 85px;
`;

export const VoteDialogPlayerSectionUsername = styled.div`
  color: black;
  font-size: 25px;
  text-align: center;
`;

export const VoteDialogSelectedPlayer = styled.div`
  display: flex;
  flex-direction: column;
  height: 95%;
  justify-content: center;
  
  border-radius: 10px;
  border-width: 3px;
  border-color: blue;
  border-style: solid;

  margin-right: 25px;
  margin-left: 0px;
`;

export const VotedConfirmation = styled.div`
  display: flex;
  flex-direction: column;
  height: 95%;
  justify-content: center;
  
  font-size: 32px;
`;
