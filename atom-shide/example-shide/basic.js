
exports.run = async function(shide) {
  // const cursor = await shide.getCursor();
  // console.log(shide.args);
  // console.log(JSON.stringify(cursor, null, 2));

  await shide.setFileContent(`/tmp/${Math.random()}`, `Wow`, { open: true, save: true });
  console.log(`end`);
}
