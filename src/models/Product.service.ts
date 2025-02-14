import { ProductStatus } from "../libs/enums/product.enum";
import { shapeIntoMongodbObject } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Error";
import { Product, ProductInput, ProductInquiry, ProductUpdateInput } from "../libs/types/product.type";
import ProductModel from "../schema/Product.model";
import { T } from "../libs/types/common";
import ViewService from "./View.service";
import { ViewInput } from "../libs/types/view.type";
import { ViewGroup } from "../libs/enums/view.enum";

class ProductService {
    private readonly productModel;
    public viewService;

    constructor() {
        this.productModel = ProductModel;
        this.viewService = new ViewService()
    }

    //SPA
    public async getProduct(member: T, id: string): Promise<Product> {
        try {
            const productId = shapeIntoMongodbObject(id);


            let product = await this.productModel.findOne({ _id: productId }).exec();
            if (!product) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

            if (member) {
                const memberId = shapeIntoMongodbObject(member._id);
                const input: ViewInput = {
                    memberId: memberId,
                    viewRefId: productId,
                    viewGroup: ViewGroup.PRODUCT
                }
                const exist = await this.viewService.checkExsistenceView(input);
                if (!exist) {
                    await this.viewService.insertNewViewer(input);
                    product = await this.productModel
                        .findOneAndUpdate(
                            { _id: productId },
                            { $inc: { productViews: 1 } },
                            { new: true }
                        ).exec();
                }
            }

            return product
        } catch (err: any) {
            throw err
        }
    }
    public async getProducts(input: ProductInquiry): Promise<Product[]> {
        try {
            const { limit, page } = input
            const match: T = { productStatus: ProductStatus.PROCESS };

            if (input.productCollection) match.productCollection = input.productCollection;
            if (input.search) match.productName = new RegExp(input.search, "i")

            const sort: T =
                input.order === "productPrice" ?
                    { [input.order]: 1 } :
                    { [input.order]: -1 };

            const products = await this.productModel.aggregate([
                { $match: match },
                { $sort: sort },
                { $skip: (page - 1) * limit },
                { $limit: limit }
            ]).exec()

            if (!products) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

            return products
        } catch (err: any) {
            throw err
        }
    }
    //SSR
    public async getAllProducts(): Promise<Product[]> {
        try {
            const result = await this.productModel.find().exec();
            if (!result.length) {
                throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
            }
            return result
        } catch (err: any) {
            throw err;
        }
    }

    public async createProduct(input: ProductInput): Promise<Product> {
        try {
            return await this.productModel.create(input);
        } catch (err: any) {
            console.log(`MONGO EROR: createProduct - ${err.message}`)
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED)
        }
    }

    public async updateChosenProduct(id: string, input: ProductUpdateInput): Promise<Product> {
        try {
            const productId = shapeIntoMongodbObject(id);
            const modifiedProduct = await this.productModel.findByIdAndUpdate(productId, input, { new: true }).exec();
            return modifiedProduct;
        } catch (err: any) {
            throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED)
        }
    }
}

export default ProductService