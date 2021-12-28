import { SCHEMA_VERSION } from "."

export const getQuestion = async (
    parent: any,
    _data: any,
    ctx: Context
): Promise<any> => {
    const {
        clients: { masterdata, catalog },
    } = ctx

    const questionResult = await masterdata.searchDocuments({
        dataEntity: 'qna',
        schema: SCHEMA_VERSION,
        fields: ['question', 'productId'],
        where: `id=${parent?.questionId}`,
        pagination: {
            page: 1,
            pageSize: 99
        }
    })

    let product: any
    const questionObj: any = questionResult[0]

    if (typeof questionObj !== 'undefined') {
        const { productId }: any = questionObj
        product = await catalog.getProductByID(productId)
    }

    const result = {
        questionText: questionObj?.question,
        product: {
            Name: product?.Name,
            LinkId: product?.LinkId

        }
    }

    return result
}