const express = require("express");
const {
    Router
} = express;
const router = Router();
const Data = require("../model/data");


const dataFilter = (datas) => {
    return datas.map((data) => {
        var data = {
            name: data.name,
            categories: data.categories.split(","),
            price: data.price,
            date: data.date,
            images: data.images
        }
        return data;
    })
}
const pageCount = async () =>{
    return await Data.collection.countDocuments();
}

const dataSort = async (data) =>{
    await data.sort(function (a, b) {
        return new Date(b.date).getTime() - new Date(a.date).getTime() ;
    });
}
router.get("/", async (req, res) => {
    let page_size=10;
    if(req.query.pageSize!==undefined && req.query.pageSize<=10 ){
        page_size=parseInt(req.query.pageSize);
    }
    let page_num = 1;
    if(req.query.page!==undefined){
        page_num=parseInt(req.query.page);
    }
    try {
        let total_page = await pageCount()/page_size;
        skips = page_size * (page_num - 1)
        let data = await Data.find().skip(skips).limit(page_size);
        res.json({
            page:parseInt(page_num),
            data: dataFilter(data),
            totalPage: parseInt(Math.round(total_page)+(((total_page % 1) > 0 && (total_page % 1)<0.5)?1:0))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json("Server Error");
    }
});

router.get("/newArrivals", async (req, res) => {
    let page_size=20;
    if(req.query.pageSize!==undefined && req.query.pageSize<=20 ){
        page_size=parseInt(req.query.pageSize);
    }
    try {
        let data = await Data.find()
        dataSort(data);
        res.json({
            data: dataFilter(data).slice(0, page_size)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json("Server Error");
    }
});
module.exports = router;