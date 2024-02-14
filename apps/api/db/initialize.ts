import { connectAgenda } from '@/jobs/agenda';
import { install } from './install';
import { UserModel } from './users';

export const initialize = async () => {
  const ready = await checkUserAdmin();
  if (!ready) await install();
  await connectAgenda();
};

const checkUserAdmin = async () => {
  let installed = true;

  //check if admin user exists
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) throw Error('Check installation Failed. Missing admin credentials');

  await UserModel.findByEmail(adminEmail).catch(() => (installed = false));

  return installed;
};
