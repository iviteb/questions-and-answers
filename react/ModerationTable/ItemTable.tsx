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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalData, setModalData] = useState<any>({})
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
          setIsModalOpen(true)
          setModalData(rowData)
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
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setModalData({})
        }}
        bottomBar={
          <div className="nowrap c-muted-1 f6">
            Produs: {modalData.question?.product?.Name || modalData.product?.Name}
          </div>
        }
      >
          {textPath === "question" ?
            <div>
              <h3>Intrebare:</h3>
              <p>{modalData[textPath]}</p>
            </div>
           :
            <div>
              <h3>Intrebare:</h3>
              <p>{modalData.question?.question}</p>
              <h3>Raspuns:</h3>
              <p>{modalData[textPath]}</p>
            </div>
          }
      </Modal>
    </>
  )
}

export default ItemTable
