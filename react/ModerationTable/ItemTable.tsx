import React, { useState, useEffect } from 'react'
import { Table, Modal } from 'vtex.styleguide'
import { useMutation, useQuery } from 'react-apollo'
import { STATUS } from '../utils/constants'


const ItemTable = ({
  schema,
  query,
  mutation,
  filter,
  textPath,
  bulkActionLabel,
  otherActionLabel,
}: any) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalData, setModalData] = useState<any>({})
  const [items, setItems] = useState<any[]>([])
  const [selectedRowsState, setSelectedRowsState] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const variables = { filter: {
    ...filter,
    searchTerm
  }}

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

  const nextStatusMain = (filterStatus:any) => {
    switch(filterStatus) {
      case STATUS.APPROVED:
        return STATUS.REJECTED
      default:
        return STATUS.APPROVED
    }
  }

  const nextStatusOther = (filterStatus:any) => {
    switch(filterStatus) {
      case STATUS.PENDING:
        return STATUS.REJECTED
      default:
        return STATUS.PENDING
    }
  }

  const updateSelectedItems = (selectedRows: any, nextStatus: (filterStatus: any) => string | undefined) => {
    const selectedIds = selectedRows.map((item: any) => item.itemId)
  
    updateItems({
      variables: {
        input: {
          ids: selectedIds,
          status: nextStatus(filter.status)
        }
      },
      optimisticResponse: true,
      update(cache) {
        const cachedData: any = cache.readQuery({ query, variables })
        const queryName = Object.keys(cachedData)[0]
  
        cache.writeQuery({
          data: {
            [queryName]: [
              ...(cachedData[queryName].filter((item: any) => !selectedIds.includes(item.id)))
            ]
          },
          query,
          variables
        })
      }
    })
    setSelectedRowsState([])
  }

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
          texts: {
            secondaryActionsLabel: 'Other actions',
            rowsSelected: (qty: any) => (
              <React.Fragment>Selected rows: {qty}</React.Fragment>
            ),
          },
          selectedRows: selectedRowsState,
          onChange: ({selectedRows}: any) => setSelectedRowsState(selectedRows),
          main: {
            label: bulkActionLabel,
            handleCallback: ({ selectedRows }: any) => updateSelectedItems(selectedRows, nextStatusMain),
          },
          others: [
            {
              label: otherActionLabel,
              isDangerous: true,
              handleCallback: ({ selectedRows }: any) => updateSelectedItems(selectedRows, nextStatusOther),
            }
          ]
        }}
        toolbar={{
          inputSearch: {
            value: searchTerm,
            placeholder: 'Search by Name, Email or ProductID',
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
            onClear: () => setSearchTerm('')
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


