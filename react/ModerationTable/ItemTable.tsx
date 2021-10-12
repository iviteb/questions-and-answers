import React, { useState, useEffect } from 'react'
import { Table, Modal } from 'vtex.styleguide'
import { useMutation, useQuery } from 'react-apollo'


const ItemTable = ({
  schema,
  query,
  mutation,
  filter,
  textPath,
  bulkActionLabel,
}: any) => {
  const [modalData, setModalData] = useState<boolean|null>(null)
  const [items, setItems] = useState<any[]>([])
  const [selectedRowsState, setSelectedRowsState] = useState([])
  const variables = { filter }

  const { data, loading } = useQuery(query, {
    variables,
    fetchPolicy: 'cache-and-network'
  })

  useEffect(() => {
    if(data?.[Object.keys(data)[0]]){
      setItems(data?.[Object.keys(data)[0]].map((item: any) => ({
        ...item,
        itemId: item.id
      })))
    }
  }, [data])

  const [updateItems] = useMutation(mutation)


  return(
    <>
      <Table
        fullWidth
        items={items}
        loading={loading}
        density="low"
        schema={{...schema}} // fix for having 2 tables with same schema
        onRowClick={({ rowData }: any) => {
          setModalData(rowData[textPath])
        }}
        bulkActions={{
          selectedRows: selectedRowsState,
          onChange: ({selectedRows}: any) => setSelectedRowsState(selectedRows),
          main: {
            label: bulkActionLabel,
            handleCallback: ({ selectedRows }: any) => {
              const selectedIds = selectedRows.map((item: any) => item.itemId)

              updateItems({
                variables: {
                  input: {
                    ids: selectedIds,
                    allowed: !filter.allowed
                  }
                },
                optimisticResponse: true,
                update(cache) {
                  const cachedData: any = cache.readQuery({ query, variables })
                  const queryName = Object.keys(cachedData)[0]

                  cache.writeQuery({
                    data: {
                      [queryName]: [
                        ...(cachedData[queryName].filter((item: any) => !selectedIds.includes(item.id) ))
                      ]
                    },
                    query,
                    variables
                  })
                }

              })
              setSelectedRowsState([])
            },
          },
        }}
      />
      <Modal
        centered
        isOpen={modalData !== null}
        onClose={() => setModalData(null)}
      >
        {modalData}
      </Modal>
    </>
  )
}

export default ItemTable
