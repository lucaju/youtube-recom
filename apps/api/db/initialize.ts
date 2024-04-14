import { connectAgenda } from '@/scheduler';
import { install } from './install';
import { UserDbModel } from './users/models';

export const initialize = async () => {
  const ready = await checkUserAdmin();
  if (!ready) await install();
  await connectAgenda();
};

const checkUserAdmin = async () => {
  //check if admin user exists
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) throw Error('Check installation Failed. Missing admin credentials');

  const admin = await UserDbModel.findOne({ email: adminEmail });
  if (!admin) return false;

  return true;
};
