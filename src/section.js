const build = async ({ type, node, index, parent }) => {
  return [
    { type: 'break' },
    { type: 'text', value: 'TODO: Section' },
  ];
}

export default build;