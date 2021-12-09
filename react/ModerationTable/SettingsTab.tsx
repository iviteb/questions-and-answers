import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import { Checkbox, Input, Button } from 'vtex.styleguide'
import { useIntl, defineMessages } from 'react-intl'

import GET_SETTINGS from '../queries/config.gql'
import SAVE_SETTINGS from '../queries/saveSettings.gql'

const messages = defineMessages({
  settings: {
    id: 'admin/questions.settings.label',
    defaultMessage: 'Settings',
  },
  maxQuestions: {
    id: 'admin/questions.max-questions.label',
    defaultMessage: 'Max Number of Questions',
  },
  anonymous: {
    id: 'admin/questions.anonymous.label',
    defaultMessage: 'Allow Anonymous',
  },
  subscriptionEmailTemplate: {
    id: 'admin/questions.subscription.label',
    defaultMessage: 'Question subscription email template',
  },
  search: {
    id: 'admin/questions.search.label',
    defaultMessage: 'Show Search Bar',
  },
  moderation: {
    id: 'admin/questions.moderation.label',
    defaultMessage: 'Require Admin Approval',
  },
  save: {
    id: 'admin/questions.save.label',
    defaultMessage: 'Save',
  },
  pendingQuestions: {
    id: 'admin/questions.pending-questions.label',
    defaultMessage: 'Pending Questions',
  },
  pendingAnswers: {
    id: 'admin/questions.pending-answers.label',
    defaultMessage: 'Pending Answers',
  },
  pending: {
    id: 'admin/questions.tab.pending.label',
    defaultMessage: 'Pending',
  },
  approvedQuestions: {
    id: 'admin/questions.tab.approved-questions.label',
    defaultMessage: 'Approved Questions',
  },
  approvedAnswers: {
    id: 'admin/questions.tab.approved-answers.label',
    defaultMessage: 'Approved Answers',
  },
  helpMaxQuestions: {
    id: 'admin/questions.modal.max-questions.help',
    defaultMessage: 'Sets a maximum number of questions per page',
  },
  helpSubscriptionEmailTemplate: {
    id: 'admin/questions.modal.subscription.help',
    defaultMessage: 'Leave empty to keep questions notification subscription system disabled',
  },
  helpAnonymous: {
    id: 'admin/questions.modal.anonymous.help',
    defaultMessage: 'Allows users to ask and answer questions without showing their names',
  },
  helpModeration: {
    id: 'admin/questions.modal.moderation.help',
    defaultMessage: 'Require administrator approval before newly submitted questions or answers are displayed',
  },
  helpSearch: {
    id: 'admin/questions.modal.search.help',
    defaultMessage: 'Allows users to search through previously asked questions',
  }
})

const SettingsTab = () => {
  const intl = useIntl()
  const [state, setState] = useState<any>({
    maxQuestions: null,
    anonymous: null,
    subscriptionEmailTemplate: null,
    search: null,
    moderation: null,
    isModalOpen: false
  })

  const { data, loading } = useQuery(GET_SETTINGS, {
    ssr: false,
  })

  const [
    saveSettings,
    { loading: saveLoading, error: saveError },
  ] = useMutation(SAVE_SETTINGS, {
    refetchQueries: ['Config']
  })

  useEffect(() => {
    if(data?.config) {
      setState({
        ...data.config
      })
    }
  }, [data])

  if(!data || loading) {
    return null
  }

  const {
    maxQuestions,
    anonymous,
    search,
    moderation,
    title,
    subscriptionEmailTemplate
  } = state

  return (
    <>
      <div className="mt7">
        <Input
          size="small"
          label={intl.formatMessage(messages.maxQuestions)}
          value={maxQuestions || 10}
          type="number"
          helpText={intl.formatMessage(messages.helpMaxQuestions)}
          onChange={(e: any) =>
            setState({ ...state, maxQuestions: +e.target.value })
          }
        />
      </div>
      <div className="mt7">
        <Input
          size="small"
          label={intl.formatMessage(messages.subscriptionEmailTemplate)}
          value={subscriptionEmailTemplate || ''}
          type="string"
          helpText={intl.formatMessage(messages.helpSubscriptionEmailTemplate)}
          onChange={(e: any) =>
            setState({ ...state, subscriptionEmailTemplate: e.target.value })
          }
        />
      </div>
      <div className="mt6">
        <Checkbox
          id="anonymous-option"
          name="anonymous-option"
          label={intl.formatMessage(messages.anonymous)}
          checked={anonymous}
          value={true}
          onChange={() => {
            setState({...state, anonymous: !anonymous})
          }}
        />
      </div>
      <p className="t-small c-muted-1 mw9">{intl.formatMessage(messages.helpAnonymous)}</p>

      <div className="mt4">
        <Checkbox
          id="search-option"
          name="search-option"
          label={intl.formatMessage(messages.search)}
          checked={search}
          value={true}
          onChange={() => {
            setState({...state, search: !search})
          }}
        />
      <p className="t-small c-muted-1 mw9">{intl.formatMessage(messages.helpSearch)}</p>

      <div className="mt4">
        <Checkbox
          id="moderation-option"
          name="moderation-option"
          label={intl.formatMessage(messages.moderation)}
          checked={moderation}
          value={true}
          onChange={() => {
            setState({...state, moderation: !moderation})
          }}
        />
      </div>
      <p className="t-small c-muted-1 mw9">{intl.formatMessage(messages.helpModeration)}</p>

      </div>
      <div className="mt6">
        <Button
          isLoading={saveLoading}
          onClick={() => {
            saveSettings({
              variables: {
                title,
                anonymous: anonymous,
                search: search,
                maxQuestions,
                moderation: moderation,
                subscriptionEmailTemplate
              },
            })
          }}
        >
          {intl.formatMessage(messages.save)}
        </Button>
      </div>
    </>
  )
}

export default SettingsTab
