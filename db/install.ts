import { blue, green, yellow } from 'kleur';
import log from 'loglevel';
import { UserModel } from './users';

export const install = async () => {
  log.info(yellow('Initial Setup'));
  log.info(blue('- Installing'));

  //A. ADMIN USER
  log.info('- Adding admin user');

  const user = new UserModel({
    email: process.env.ADMIN_EMAIL,
    name: process.env.ADMIN_NAME,
    role: 'admin',
    password: process.env.ADMIN_PWD,
  });

  await user.save().catch((error) => {
    throw new Error({
      _message: 'Installation Failed. MongoDB faild to create admin user',
      ...error,
    });
  });

  log.info(green('Installed and Ready!'));
};
