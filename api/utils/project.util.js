function isUserAuthed(project, user) {
  if (!project || !user) return false;
  return (
    String(project?.ownerId) === String(user._id) ||
    project?.authedUsers?.find((u) => String(u) === String(user._id))
  );
}

module.exports = {
  isUserAuthed,
};
