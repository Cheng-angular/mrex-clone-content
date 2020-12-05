import axios from 'axios';
import cheerio from 'cheerio';
import { environment, environment1 } from './env';

var fs = require('fs');
const targeturl = environment.serverUrl;
const eng = 'en';
const french = 'fr';
// let inputfile = () => {
//     if (targeturl.includes(eng)) {         
//        return filename = "en.json";
//     } else if(targeturl.includes(french)) {
//         return filename = "fr.json";                
//     }
// }
const AxiosInstance = axios.create();
let articleData: Articles[] = [];

interface Articles {
    title: string;
    summary: string;
    author: string;
    authorDescription: string;
    htmlContent: string;
    publishDate: string;
    language: string;
    publicUrl: string;
    authorPicture: string;
    thumbnailUrl: string;
}

AxiosInstance.get(targeturl)
.then(
    response => {
        const html = response.data;
        const $ = cheerio.load(html);
        const thumbnail = $('.list_articles > li > a');        
        thumbnail.each((i, elem) => {
            const thumbnailUrl = $(elem).attr().href;      
            AxiosInstance.get(thumbnailUrl)
            .then(
                response => {
                    const htmlcontent = response.data;
                    const $ = cheerio.load(htmlcontent);
                    const content = $('#page').html();
                    const title = $(content).find('#single_hero_content_title').text().trim();
                    const summary = $(content).find('#single_post_excerpt > p').text();
                    const author = $(content).find('#single_hero_content_pre_title').text().slice(3);
                    const authorDescription = $(content).find('#single_post_content > p:last-child').text();
                    const htmlContent = $('#single_post_content_container').children().html();
                    const publishDate = $(content).find('#single_hero_content_surtitle').text();
                    const authorPicture = $(content).find('#single_post_author_pic').attr().style.slice(24, -3);
                    articleData.push({
                        title: title,
                        summary: summary,
                        author: author,
                        authorDescription: authorDescription,
                        htmlContent: htmlContent,
                        publishDate: publishDate,
                        language: 'en',
                        publicUrl: targeturl,
                        authorPicture: authorPicture,
                        thumbnailUrl: thumbnailUrl
                    });                    
                    fs.writeFile ('input.json', JSON.stringify(articleData), function(err){
                        if(err) throw err;
                    })
                }
            )
            
        });
        
    }
).catch(console.error);

