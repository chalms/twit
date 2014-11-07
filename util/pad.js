module.exports = function (standardCallback, funct) {
    try {
      funct()
    } catch (err) {
    console.log(colors.red('Error determining if user exists!'));
    console.log(err);
    standardCallback(err, undefined);
  }
}