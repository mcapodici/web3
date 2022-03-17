enum NotConnectedReason {
  NotChecked,
  NoProvider,

  /* Provider installed but account not connected because either acount not authorized
  or password needs to be entered or something like that */
  NotConnected, 
  WrongNetwork,
}

export default NotConnectedReason;