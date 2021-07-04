const main_content=document.querySelector(".main_content")
const main_header=document.querySelector(".main_header")
news_per_page=1 //global, for number of row news and loaded more news

function xhr_request(calback_fun=[],args={},news_per_page=1,check_more_news=[]){ //calback_fun_arr.- function for filter by category, args-args for filter, news_per_page-for load more news, check_more_news arr-function for chek no. of news and display mess no more news
    const xhr= new XMLHttpRequest()

    xhr.onload=()=>{

        if(xhr.readyState==4 && xhr.status==200){
            var items=xhr.responseXML.querySelectorAll("item")
            
            display_category_list(items,args) // fore header and category list

            for(let callback of calback_fun){ // checking filter functions  
                items=callback(items,args)
            }

            for(let callback_check_news of check_more_news){ //checking function for cehek no of news and display msg if all massages are loaded
                callback_check_news(items)
            }

            display_data(items,news_per_page)   //display data of news
        }

        if(xhr.readyState==4&&xhr.status>400){
            main_content.innerHTML=`<h1>Error:${xhr.status}</h1><p>${xhr.statusText}</p>`
        }
      
    }

    xhr.open("GET","https://www.wired.com/feed/rss")
    xhr.send()
}

function display_data(items,news_per_page) {
    let no_of_news = 1 // for no of new,  first 5 news have spec.position, first two are in first row, 3.,4.,5. news are in sec. row  all news after 5. have same position,
    let first_row_news = [] //arr for news in frst row
    let sec_row_news = []//arr for sec row
    let rows_news = [] // arr for all news after 5. news
    
    for (let item of items) {
        const title = item.querySelector("title").textContent
        const link = item.querySelector("link").textContent
        const pub_date = new Date(item.querySelector("pubDate").textContent).toDateString()
        const description = item.querySelector("description").textContent
        const category = item.querySelector("category").textContent
        const img = item.getElementsByTagName("media:thumbnail")[0].getAttribute("url")
        const img_attr = `src="${img}"`

        

        if (no_of_news < 3) { //add in first row first two news

            first_row_news.push({
                "title": title,
                "link": link,
                "pub_date": pub_date,
                "description": description,
                "category": category,
                "img_attr": img_attr,
            })
        } else if (no_of_news > 2 && no_of_news < 6) {

            sec_row_news.push({  //add in sec row 3.,4.,5. news
                "title": title,
                "link": link,
                "pub_date": pub_date,
                "description": description,
                "category": category,
                "img_attr": img_attr
            })
        } else if (no_of_news > 5) {

            rows_news.push({ //add ather news i row
                "title": title,
                "link": link,
                "pub_date": pub_date,
                "description": description,
                "category": category,
                "img_attr": img_attr,
            })
        }

        no_of_news++ // counter for no. of news

    }

    nunjucks.configure("./template", { autoescape: false }) //nunjuck conf

    main_content.innerHTML = nunjucks.render("main.njk", { //nunjuck data
        "first_row_news": first_row_news,
        "sec_row_news": sec_row_news,
        "rows_news": rows_news,
        "news_per_page":news_per_page
    })
    
}

function show_by_category(items,args){ // filter by category
    let category_items=[]
    for (let item of items){
        const category = item.querySelector("category").textContent
        if(category==args["category"]){
            category_items.push(item)
        }
    }
    return category_items
}

function display_category_list(items,args){ //fun for display header and category list
    let categores_list = []
    for(let item of items){
        const category = item.querySelector("category").textContent
        if (!categores_list.includes(category)) {
            categores_list.push(category)
        }
    }

    nunjucks.configure("./template", { autoescape: false })

    main_header.innerHTML = nunjucks.render("header.njk", { // display header and category list
        "categores_list":categores_list,
        "selected_category":args["category"]
    })
}

function check_more_news(items){ //chacking for more news and displey mass if all mesg are loaded
    if(items.length<news_per_page+2){
        const popup_msg_wrapper=document.querySelector(".popup_msg_wrapper")
        popup_msg_wrapper.style.display="initial"
    }
}

function close_popup_smg(){ //fun for close message 
    const popup_msg_wrapper=document.querySelector(".popup_msg_wrapper")
    popup_msg_wrapper.style.display="none"

}

window.onload=(e)=>{
    xhr_request()
}

document.body.onclick=(e)=>{
    if(e.target.tagName=="A"&&e.target.getAttribute("href").indexOf("#category")>-1){ //when click on category pill
        let url=e.target.getAttribute("href")
        let split_url=url.split("/")
        xhr_request([show_by_category],{"category":split_url[1]})
        news_per_page=1

    }
    if(e.target.tagName=="A"&&e.target.getAttribute("href").indexOf("#home")>-1){ // for click on home link
        xhr_request()
        news_per_page=1

    }
    if(e.target.getAttribute("class")=="more" ){ //  loadin more news
        news_per_page+=3
        if(location.hash==""||location.hash=="#home"){ //if loading more news on home page
            xhr_request([],{},news_per_page,[check_more_news])
        }else{                              //if loading more news on other  page
            let url=location.hash
            let split_url=url.split("/")
            xhr_request([show_by_category],{"category":split_url[1]},news_per_page,[check_more_news])
        }
    }
}
document.querySelector(".close_msg_butt").onclick=close_popup_smg //butt for cloase msg 
document.querySelector(".x_butt").onclick=close_popup_smg









    
   