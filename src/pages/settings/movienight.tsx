import SettingsLayout from '@app/components/Settings/SettingsLayout';
import SettingsMovieNight from '@app/components/Settings/SettingsMovieNight';
import useRouteGuard from '@app/hooks/useRouteGuard';
import { Permission } from '@app/hooks/useUser';
import type { NextPage } from 'next';

const SettingsMovieNightPage: NextPage = () => {
  useRouteGuard(Permission.ADMIN);
  return (
    <SettingsLayout>
      <SettingsMovieNight />
    </SettingsLayout>
  );
};

export default SettingsMovieNightPage;
