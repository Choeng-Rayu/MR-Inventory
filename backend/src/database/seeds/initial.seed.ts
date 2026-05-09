import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../common/entities/user.entity';
import { Setting } from '../../common/entities/setting.entity';

export async function runInitialSeeds(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const settingRepository = dataSource.getRepository(Setting);

  // Seed default admin user
  const adminExists = await userRepository.findOne({ where: { email: 'admin@inventory.local' } });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = userRepository.create({
      email: 'admin@inventory.local',
      passwordHash,
      name: 'System Administrator',
    });
    await userRepository.save(admin);
    console.log('Default admin user created');
  }

  // Seed default settings
  const defaults = [
    { keyName: 'near_expiry_threshold', value: '30' },
    { keyName: 'low_stock_threshold', value: '10' },
    { keyName: 'telegram_enabled', value: 'false' },
  ];

  for (const def of defaults) {
    const exists = await settingRepository.findOne({ where: { keyName: def.keyName } });
    if (!exists) {
      const setting = settingRepository.create(def);
      await settingRepository.save(setting);
    }
  }
  console.log('Default settings created');
}
