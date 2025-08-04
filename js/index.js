window.onload = ()=>{
    //初期表示（全検索）
    scan();
    document.getElementById("id-val").innerHTML = SignInStatus.currentCognitoUser.username;
}

//全検索
const scan = async()=> {
        //全検索API適用
        const items = await item("scan");
        //並び替え適応
        items.sort(sortId);
        //集計表示
        await totalPrice(items);
        await thisMoPrice(items);
        //配置メソッド適用
        await setItems(items);
}

//API処理
const item = async (search_value) => {
    var param;
    const updateId = SignInStatus.currentCognitoUser.username;
    switch(search_value){
        case "scan":
            //全検索 & 初期表示
            allDelete();
            param = {
                "flag" : "scan",
                "id" : null,
                "UserId" : updateId
            };
        break;
        case "search":
            //リセット
            allDelete();
            param = {
                "flag" : "search",
                "searchCategory": $('#search-category').val(),
                "searchWord": $('#free-search').val(),
                "startDate": $('#startDate').val(),
                "endDate": $('#endDate').val(),
                "UserId" : updateId
            };
    }
    
    // headerオブジェクト
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
        // JSON作成
    var json = JSON.stringify(param);
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: json,
        redirect: 'follow'
    };
    console.log(json);
    //API呼び出し
    return fetch("https://timrkmv8gi.execute-api.ap-northeast-1.amazonaws.com/dev/",requestOptions)
        .then(response => response.json()) //レスポンス本文をJSONとしてパース
        .then((json)=>json.body) //bodyのみ引き出し
        .catch((error) => { alert("ERROR" + error);})
}

//並び替えメソッド（使用日順）
sortId = (val1,val2)=> {
    if(val1.UsedDate < val2.UsedDate) {
        return 1;
        } else {
            return -1;
        }
}

//配置メソッド<img src="img/edit_btn.svg" alt="修正ボタン" />
const setItems = async (items) => {
    for(let i = 0; i < items.length; i++){
        let table = document.getElementById("ExpensesTable");
        let tr = $("<tr class = 'trTable'></tr>").appendTo(table);
        $("<td class='edit'> <input type='image' src='img/edit_btn.png' alt='編集ボタン' class='btn-edit' value='修正' id='" +items[i].ID+ "' onclick='editAPI(this.id)'></td>").appendTo(tr);
        $("<td class='date'>"+ items[i].UsedDate + "</td>").appendTo(tr);
        $("<td class='category'>"+ items[i].Category + "</td>").appendTo(tr);
        $("<td class='name'>"+ items[i].Name + "</td>").appendTo(tr);
        $("<td class='price'>"+ items[i].Price.toLocaleString() + "</td>").appendTo(tr);
        $("<td class='memo'>"+ items[i].Memo + "</td>").appendTo(tr);
    };
    document.getElementById("count").innerHTML = items.length;
}

//全削除メソッド
const allDelete = ()=>{
    var table = document.getElementById("ExpensesTable");
    var rowLen = table.rows.length;
    for (var i = rowLen-1; i >= 0; i--) {
        table.deleteRow(i);
    }
}

//検索した分の集計(reduce関数 = groupbyみたいな)
const totalPrice = async (items) =>{
    //総合値
    let price = items.reduce((result, element) => {
        let num = element.Price;
        return result + num; //sum
    }, 0);
    tprice = price.toLocaleString();
    //配置
    document.getElementById("t-val").innerHTML = tprice;
} 

//今月値の集計
const thisMoPrice = async (items) =>{ 
    //月初（Moment.js使用）
    let startMonth = String(moment().startOf('month').format("YYYY-MM-DD"));
    //月末（Moment.js使用）
    let endMonth = String(moment().endOf('month').format("YYYY-MM-DD"));
    //今月分のみのJSON
    let thisMoitems = items.filter(val => val.UsedDate >= startMonth && val.UsedDate <= endMonth)
    console.log(thisMoitems);
    //今月分の合計
    let price = thisMoitems.reduce((result, element) => {
        let num = element.Price;
        return result + num; //sum
    }, 0);
    mPrice = price.toLocaleString();
    //配置
    document.getElementById("m-val").innerHTML = mPrice;
}

//検索機能
const searchAPI = ()=>{
    //空チェック
    let checkEmp = document.getElementsByClassName('searchCheck');
    let checkReScanFlag = 0;
    for (var i = 0; i < checkEmp.length; i++){
        if(checkEmp[i].value == ""){
            checkReScanFlag++
        }
    }
    //空なら再検索
    if(checkReScanFlag == checkEmp.length){
        scan();
    }else{
        (async()=> {
            //フリーワード検索API適用
            const items = await item("search");
            //並び替え適応
            items.sort(sortId);
            //集計表示
            await totalPrice(items);
            //配置メソッド適用
            await setItems(items);
            })();
    }
}

const clearAPI = ()=>{
    let checkEmp = document.getElementsByClassName('searchCheck');
    for (var i = 0; i < checkEmp.length; i++){
        checkEmp[i].value = "";
    }
}

//編集ページへ移動
const editAPI = (id_value)=>{
    //idの取得確認
    console.log("取得ID" + id_value)
    //クエリ（?変数名=値）を付与して遷移
    location.href='./input.html?id=' + encodeURIComponent(id_value);
}