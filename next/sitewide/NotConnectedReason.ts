enum NotConnectedReason {
  /* For pages not needing web3 */
  DontCare,
  StillChecking,
  NoProvider,

  /* Provider installed but account not connected because either acount not authorized
  or password needs to be entered or something like that */
  NotConnected, 
  WrongNetwork,

  /* You are actually connected */
  None
}

export default NotConnectedReason;