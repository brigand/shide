
exports.run = async function(shide) {
  const files = await shide.getCursor();
  console.log(files);
}
