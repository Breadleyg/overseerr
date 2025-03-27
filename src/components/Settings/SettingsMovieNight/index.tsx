import Button from '@app/components/Common/Button';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import PageTitle from '@app/components/Common/PageTitle';
import { Permission, useUser } from '@app/hooks/useUser';
import globalMessages from '@app/i18n/globalMessages';
import { ArrowDownOnSquareIcon } from '@heroicons/react/24/outline';
import type { MovieNightSettings } from '@server/lib/settings';
import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import { defineMessages, useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import useSWR, { mutate } from 'swr';

const messages = defineMessages({
  movienight: 'Movie night',
  movienightsettings: 'Movie night settings',
  movienightsettingsDescription:
    'Configure settings for the movie night module.',
  toastSettingsSuccess: 'Movienight settings saved successfully!',
  toastSettingsFailure: 'Something went wrong while saving settings.',
  movienightenabled: 'Enable the movie night module',
  moviesperevent: 'Amount of movies per event',
});

const SettingsMovieNight = () => {
  const { addToast } = useToasts();
  const { hasPermission: userHasPermission } = useUser();
  const intl = useIntl();
  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<MovieNightSettings>('/api/v1/settings/movienight');

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <PageTitle
        title={[
          intl.formatMessage(messages.movienight),
          intl.formatMessage(globalMessages.settings),
        ]}
      />
      <div className="mb-6">
        <h3 className="heading">
          {intl.formatMessage(messages.movienightsettings)}
        </h3>
        <p className="description">
          {intl.formatMessage(messages.movienightsettingsDescription)}
        </p>
      </div>
      <div className="section">
        <Formik
          initialValues={{
            movieNightEnabled: data?.movieNightEnabled ?? 0,
            moviesPerEvent: data?.moviesPerEvent ?? 4,
          }}
          enableReinitialize
          onSubmit={async (values) => {
            try {
              await axios.post('/api/v1/settings/movienight', {
                movieNightEnabled: values.movieNightEnabled,
                moviesPerEvent: values.moviesPerEvent,
              });
              mutate('/api/v1/settings/public');

              addToast(intl.formatMessage(messages.toastSettingsSuccess), {
                autoDismiss: true,
                appearance: 'success',
              });
            } catch (e) {
              addToast(intl.formatMessage(messages.toastSettingsFailure), {
                autoDismiss: true,
                appearance: 'error',
              });
            } finally {
              revalidate();
            }
          }}
        >
          {({ isSubmitting, isValid, values, setFieldValue }) => {
            return (
              <Form className="section" data-testid="settings-main-form">
                {userHasPermission(Permission.ADMIN) && (
                  <div className="form-row">
                    <label htmlFor="movieNightEnabled" className="text-label">
                      {intl.formatMessage(messages.movienightenabled)}
                    </label>
                    <div className="form-input-area">
                      <Field
                        type="checkbox"
                        id="movieNightEnabled"
                        name="movieNightEnabled"
                        onChange={() => {
                          setFieldValue(
                            'movieNightEnabled',
                            !values.movieNightEnabled
                          );
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="form-row">
                  <label htmlFor="moviesPerEvent" className="text-label">
                    {intl.formatMessage(messages.moviesperevent)}
                  </label>
                  <div className="form-input-area">
                    <div className="form-input-field">
                      <Field
                        id="moviesPerEvent"
                        name="moviesPerEvent"
                        type="text"
                      />
                    </div>
                  </div>
                </div>
                <div className="actions">
                  <div className="flex justify-end">
                    <span className="ml-3 inline-flex rounded-md shadow-sm">
                      <Button
                        buttonType="primary"
                        type="submit"
                        disabled={isSubmitting || !isValid}
                      >
                        <ArrowDownOnSquareIcon />
                        <span>
                          {isSubmitting
                            ? intl.formatMessage(globalMessages.saving)
                            : intl.formatMessage(globalMessages.save)}
                        </span>
                      </Button>
                    </span>
                  </div>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </>
  );
};

export default SettingsMovieNight;
