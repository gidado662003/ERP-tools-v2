function makePrivateChatKey(userA, userB) {
  return [userA.toString(), userB.toString()].sort().join("_");
}

module.exports = { makePrivateChatKey };
