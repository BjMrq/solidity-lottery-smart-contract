export type NewParticipantEvent = {
  returnValues: {
    participantAddress: string;
    participationValue: string;
  };
};

export type WinnerEvent = {
  returnValues: {
    winnerAddress: string;
  };
};
