### Project sử dụng ExpressJs dành cho Ecommerce
## Dev enviroment, deploy(ENV), cách vận hành
### ENV:
URI của mongodb, production="false"/"true" (string, không phải boolean)
### Dev enviroment
production="false"/"true" sẽ quyết định biến origin để cookie gửi qua http hay https, do Chrome và các Web browser hiện đại yêu cầu Session cookie gưi qua https khác với HTTP nên product="false" sẽ edit origin và cookie cho http(http có secure: 'auto' và sameSite:'lax') và production="true" sẽ edit cookie cho https(secure:true và sameSite:'none').
### process.env.production
production="true", và khi đó origin sẽ là ['https://asm3-mon5.web.app','https://admin-hotel-asm2.web.app'], nếu production="false" origin sẽ là ['http://localhost:3000,http://localhost:3001'] (bao gồm server của Client và Admin). Ngoài ra Admin và Client cần phải bật ở 2 User khác nhau của Chrome, do session đến cùng từ 1 server

### Deploy
Sử dụng replit với coldstart, nên load sản phẩm trên Client lúc đầu sẽ mất tầm 30s, ENV lưu trên replit có production="true". Server tại

## /admin route cho Admin
### Đăng nhập
Post request username và password, nếu tài khoản database có admin:true thì sẽ sử dụng được admin site tại https://github.com/dreemurgithub/front-end-admin thông qua session. Dùng middleware trên controller/admin.js
```
function isAdmin(req, res, next) {
    if (req.url === '/admin/signout' || req.url === '/admin/login') {
        next();
        return
    }
    if (req.session.isAdmin === true) {
        next();
        return;
    } else res.send([]) // luôn return [] để cho list
}
Admin_Route.use(isAdmin)
```
### Authentication
Mọi route đều bị block nếu session.isAdmin !== true, ngoại trừ /admin/login cho đăng nhập
### Homepage cho Admin site
Sử dụng mongodb limit(8) để chỉ trả về 8 hoặc số kết quả yêu cầu, với lệnh await Transaction_Schema.find().
### Edit Hotel
Lấy ID của Hotel qua Hotel_Schema trên data/index.js, lấy Document trong mongodb với findone, rồi update document đó và save lại trên lệnh put request ở /admin/hotel .
### New Hotel
Tạo Document mới với Hotel_Schema trond data/index.js từ post request ở /admin/hotel.
## New Room/Delete room
Get request tại /admin/rooms sẽ lấy toàn bộ Hotel hiện tại cho phép ta Select tên Hotel để auto fill hotel ID cho phép chọn được Hotel cho phòng mới dễ dàng. Sau đó thực hiện post request tới /admin/rooms để tạo room mới. Delete room tại /admin/rooms/:id/:hotel
### Mọi transaction, limit 5 mỗi trang 
/admin/tran/:page với
```
const page = parseInt(req.params.page)
const array = await Transaction_Schema.find().sort({createAt: -1}).skip(page*5).limit(5)
```
và ta sẽ có số trang theo thứ tự từ 0
## /... mọi thứ còn lại cho User


Với origin ở đây là  ["https://hotel-asm.web.app", "https://admin-hotel-asm2.web.app"] trên deploy và  ['http://localhost:3000','http://localhost:3001'] của dev enviroment
## /user route cho user
### Danh sách Hotel và từng Hotel
Danh sách Hotel trên homepage bị giới hạn là 3 Hotel có rating cao nhất, từ /hotel_list . và /hotel_list/:id với useLocation() của react sẽ lấy id trên URL frontend và thực hiện get request để return chi tiết hotel qua ID.

### Thông tin Homepage
Tạo Object lớn tại /home trong controller/hotel.js với query của Da_Nang, Ha_noi... và send về client
```
res.send({
        Da_nang: Da_nang.length,
        Ha_noi: Ha_noi.length,
        HCM: HCM.length,
        hotel: hotel.length,
        apartment: apartment.length,
        resorts: resorts.length,
        villas: villas.length,
        cabins: cabins.length,
    })
```
Đếm số lượng các loại hotel đang có + từng tỉnh thành
### Query Hotel theo một số thông tin khác trừ ngày trống.
Việc tìm kiếm Hotel đúng yêu cầu rất dễ, với post request gửi qua /search trong controller/hotel.js có thể dễ dàng tìm được các thông tin căn bản. Nhưng khi tìm kiếm chính xác theo thời gian trống phòng sẽ khá phức tạp
### Query Hotel theo ngày trống của phòng
Function date_loop để return array của ngày trên Client gửi về, chuyển thành hour(0) minute(0)... và convert qua con số bằng getTime()
```
function date_loop(date_end, date_start) {
    const new_date_start = new Date(date_start)
    const new_date_end = new Date(date_end)
    const list = []
    while (new_date_start.getTime() <= new_date_end.getTime()) {
        const new_p = new Date(new_date_start)
        list.push(new_p)
        new_date_start.setDate(new_date_start.getDate() + 1)
    }
    return list
}
```
Mọi Room document của mongodb được tạo ra có sẵn props là date_fill, chứa toàn bộ date book, chuyển thành hour(0) minute(0)..., kiểm tra như sau
```
room_obj.forEach(el=>el.date_fill.forEach(room=> {
        room.count = 0
        const time_room = room.date.map(el=>el.getTime())
        const check_ = list_time_num
        time_room.forEach(el=>{ // date của phòng bên trong date của user date , tăng count
            if(list_time_num.includes(el) ) room.count+=1
            // count===0 mới trả về room
        })
    }) )
```
Tức là bất cứ room nào có date(đã chuyển về hou-min-sec 0,0,0) chứa bên trong list_time_num(là array return từ functiond date_loop) thì sẽ xóa room đó khỏi danh sách, và một Hotel có số lượng room available ít nhất là bằng số người/phòng trên client chuyển về, sử dụng lệnh filter phức tạp
```
arr_filter_maxPeople.forEach(el=>{
        for (let i = 0; i < arr_obj.length; i++)
            if (arr_obj[i]._id.toString()===el.hotel) arr_obj[i]['room_list'] = el
    })
    const log_arr_obj_filter = arr_filter_maxPeople
    arr_obj.forEach(hotel=>{
       if(hotel.room_list!==undefined && hotel.room_list!== null ) hotel['room_avai'] =  hotel.room_list.filter_date.length
    })

    const arr_hotel = arr_obj.filter(hotel=>hotel.room_avai!== undefined || hotel.room_avai>0 || hotel.room_list!== undefined)
    // remove các hotel ko có phòng phù hợp
    const arr_hotel_room = arr_hotel.filter(hotel=> (hotel.room_avai>=parseInt(req.body.people.room))
        && (hotel.cheapestPrice >= parseInt(req.body.people.min)) && (hotel.cheapestPrice<=parseInt(req.body.people.max))
    )
    arr_hotel_room.sort((a,b)=>b.rating-a.rating) // sort cho đẹp
    res.send( arr_hotel_room)
```
Do code viết trong lúc đang học nên chưa chuẩn mực lắm, đúng ra nên tạo một database riêng cho mỗi phòng 101,102... và check danh sách date, thay vì dùng lệnh filter phức tạp, chỉ cần thực hiện phép cộng lại cho mỗi hotel để biết xem lệnh search có phù hợp không
### /user /userlogin cho các request đăng nhập, đăng ký, signout
post request /user sẽ kiểm tra có sẵn email chưa. /userlogin với post request để signin, /userlogin với get request để signout và xóa cookie với session
### Transaction của từng user
post request vào /booking sẽ tạo transaction mới và thêm ngày mới vào bên trong room document, mục .date_fill, nên sử dụng thêm 1 collection cho riêng mục này. Và /booking/:userid sẽ return toàn bộ transaction của user đó.
### controller/index.js để dính hết các route lại với nhau
```
const controller = require('express')()
const hotel_route = require('./hotel');controller.use(hotel_route)
const user_route = require('./user');controller.use(user_route)
const transcation_route = require('./transaction'); controller.use(transcation_route)
const Admin_route = require('./admin');controller.use(Admin_route)
```


## Deploy và cors
### Server
https://Hotelbackendasm2.ducminh27.repl.co (chỉ có thể access qua fetch request từ https://hotel-asm.web.app và https://admin-hotel-asm2.web.app ) qua middleware
```
app.use((req, res, next) => {
    if (origin.includes(req.get('origin'))) {
        app.set('trust proxy', 1)
        res.setHeader("Access-Control-Allow-Origin", true);
        // res.header('Access-Control-Allow-Credentials', true)
        next()
    }
});
```
Với origin ở đây là  ['https://hotel-asm.web.app','https://admin-hotel-asm2.web.app'] trên deploy và  ['http://localhost:3000','http://localhost:3001'] của dev enviroment
### Admin và Client
User Client https://github.com/dreemurgithub/Frontend-asm2-mon5 và Admin Client https://github.com/dreemurgithub/front-end-admin
