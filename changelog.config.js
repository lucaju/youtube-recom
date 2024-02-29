module.exports = {
  path: 'git-cz',
  format: '{type}{scope}: {emoji}{subject}',
  maxMessageLength: 110,
  questions: ['scope', 'type', 'subject', 'body', 'breaking', 'issues'],
  scopes: ['root', 'cli', 'api', 'crawler', 'lint'],
};
