import React, { FC } from 'react'
import { FormattedMessage } from 'react-intl'
import { Layout, PageBlock, PageHeader } from 'vtex.styleguide'

import ModerationTable from './ModerationTable'

import './styles.global.css'

const AdminExample: FC = () => {
  return (
    <Layout
      pageHeader={
        <PageHeader
          title={<FormattedMessage id="admin/question.menu.title" />}
        />
      }
    >
      <PageBlock variation="full">
        <ModerationTable />
      </PageBlock>
    </Layout>
  )
}

export default AdminExample
