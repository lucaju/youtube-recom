import { log } from '@/util/log';
import kleur from 'kleur';
import { UserDbModel } from './users/models';

export const install = async () => {
  log.info(kleur.yellow('Initial Setup'));
  log.info(kleur.blue('- Installing'));

  //A. ADMIN USER
  log.info('- Adding admin user');

  const user = new UserDbModel({
    email: process.env.ADMIN_EMAIL,
    name: process.env.ADMIN_NAME,
    role: 'admin',
    password: process.env.ADMIN_PWD,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await user.save().catch((error: any) => {
    throw new Error(`Installation Failed. MongoDB faild to create admin user: ${error}`);
  });

  log.info(kleur.green('Installed and Ready!'));
};
