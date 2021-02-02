import React, { FC, useState } from 'react'
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl'
import PropTypes from 'prop-types'
import { Table } from 'vtex.styleguide'


const ItemTable: FC<WrappedComponentProps & any> = ({
  initialState,
  onChange,
  intl,
}) => {
  const [state, setState] = useState<any>({
    tableKey: initialState.updateTableKey,
    items: initialState.items,
    schema: initialState.schema
  })

  const {tableKey, items, schema} = state

  return(
    <div>
      <Table
        fullWidth
        updateTableKey={tableKey}
        items={items}
        density="low"
        schema={schema}
      />
    </div>
  )
}

ItemTable.propTypes = {
  onChange: PropTypes.func,
  initialState: PropTypes.any,
  intl: PropTypes.any,
}

export default injectIntl(ItemTable)
