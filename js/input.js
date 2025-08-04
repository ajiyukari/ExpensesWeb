//「location.search」でURLのクエリ部分だけを抽出
let query = location.search;
//「split()」を使って「=」の部分でidと値を分割（"id","数字"）
let getId = query.split('=');
let editId = Number(getId[1]);
console.log("取得ID:"+editId)

//初期表示（ボタン切り替え）
window.onload = ()=>{
    document.getElementById("id-val").innerHTML = SignInStatus.currentCognitoUser.username;
    if(editId >= 0){
        edit();
        document.getElementById("input").style.display = "none";
        document.getElementById("category").disabled = true;
        document.getElementById("exlain").innerHTML = "出費の詳細を確認してください";
    }else{
        document.getElementById("update").style.display = "none";
        document.getElementById("delete").style.display = "none";
        document.getElementById("exlain").innerHTML = "出費の詳細を入力してください";
    }
}
//配置
const edit = async()=> {
    //値の引き出し
    const items = await item("edit");
    //配置
    await setItems(items.body);
}

//各API呼び出し
const callAPI = async(id_value)=>{
    let errorCheck = checkAPI();
    if(errorCheck == "okay"){
        let message
        switch(id_value){
            case "input":
                message = "登録しますか"
            break;
            case "update":
                message = "更新しますか"
            break;
            case "delete":
                message = "本当に削除しますか"
            break;
        }
        var res = confirm(message);
        if( res == true ) {
            // OKなら適用
            const items = await item(id_value);
            console.log(items.statusCode +"＆"+items.body);
            if(items.statusCode == 200){
                // ステータスが200の場合のみ画面遷移
                location.href = "./index.html";
                //ログイン情報の引き渡し
            }      
         }     
    }
}

//配置メソッド
const setItems = (editItem) => {
    $('#category').val(editItem[0].Category);
    $('#name').val(editItem[0].Name);
    $('#price').val(editItem[0].Price);
    $('#usedDate').val(editItem[0].UsedDate);
    $('#memo').val(editItem[0].Memo);
}

//API引き出し
const item = (process_value)=>{
    var param;
    const updateId = SignInStatus.currentCognitoUser.username;
    switch(process_value){
        //登録
        case "input":
            param = {
                "flag" : "input",
                "Category": $('#category').val(),
                "Name": $('#name').val(),
                'Price': $('#price').val(),
                "UsedDate": $('#usedDate').val(),
                "Memo": $('#memo').val(),
                "UserId":updateId
            };
        break;
        //IDの受け渡し（編集）
        case "edit":
            param = {
                "flag" : "edit",
                "id" : editId
            };
        break;
        //更新の場合
        case "update":
            param = {
            "flag" : "update",
            "id" : editId,
            "Category": $('#category').val(),
            "Name": $('#name').val(),
            "Price": $('#price').val(),
            "UsedDate": $('#usedDate').val(),
            "Memo": $('#memo').val(),
            "UserId":updateId
            };
        break;
        //削除の場合
        case "delete":
            param = {
                "flag" : "delete",
                "id" : editId,
                "Category": $('#category').val()
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
        .then(response => response.json()) // レスポンス本文をJSONとしてパース
        // .then((json)=>json.body)//JSONに変換
        // .then(document.location = "./index.html")
        .catch((error) => { alert("ERROR" + error);})
}

//入力チェック
const checkAPI = ()=>{
    //クリアフラグ
    let checkEmpFlag = 0;
    let checkNumFlag = 0;
    let checkDateFlag = 0;
    //エラー時の背景色
    let errorColor = "#ffa9b4";
    let nomalColor = "#FFF";

    // スクリプトインジェクション
    // const dec = Encoding.urlDecode(
    //     checkEmp[4].value
    // );
    // const decArray = Encoding.codeToString(dec);
    // const utfArray = Encoding.convert(decArray, {
    //     to: "UNICODE",
    //     from: "UTF8",
    // });
    // console.log(utfArray);

    //値段チェック
    let checkNum = document.getElementsByClassName('checkNum');
    //エラーメッセージ
    let errorNumMsg = document.getElementsByClassName('errNum_msg');
    let msg_num = "半角数字のみ入力してください";
    for (var i = 0; i < checkNum.length; i++){
        let val = checkNum[i].value;
        if(val != ""){
            if(String(val).match("^[0-9]+$")){
                //ゼロサプレス
                let zeroSp = Number(val);
                checkNum[i].value = zeroSp;
                checkNumFlag++
                checkNum[i].style.backgroundColor = nomalColor;
                errorNumMsg[i].innerHTML = "";
            }else{
                checkNum[i].style.backgroundColor = errorColor;
                errorNumMsg[i].innerHTML = msg_num;
            }
        }  
    }
    //日付範囲チェック
    let checkDate = document.getElementsByClassName('checkDate');
    //エラーメッセージ
    let errDateMsg = document.getElementsByClassName('errDate_msg');
    let msg_date = "タイムトラベルしないでください（1900〜2025年でお願いします）";
    let maxDate=new Date(2026,1-1,1) // 日付範囲の上限(Dateオブジェクトは月は-1 時間のズレで12/31で入れると面倒)
    let minDate=new Date(1900,1-1,1) // 日付範囲の下限(Dateオブジェクトは月は-1)
    const Dateval = new Date(checkDate[0].value);
    if(Dateval != ""){
        if(maxDate > Dateval && minDate <= Dateval){
            checkDateFlag++
            checkDate[0].style.backgroundColor = nomalColor;
            errDateMsg[0].innerHTML = "";
        }else{
            checkDate[0].style.backgroundColor = errorColor;
            errDateMsg[0].innerHTML = msg_date;
        }
    }

    //空チェック
    let checkEmp = document.getElementsByClassName('checkEmp');
    //エラーメッセージ
    let errorEmpMsg = document.getElementsByClassName('errEmp_msg');
    let msg_emp = "入力してください";
    for (var i = 0; i < checkEmp.length; i++){
        if(checkEmp[i].value == ""){
            checkEmp[i].style.backgroundColor = errorColor;
            errorEmpMsg[i].innerHTML = msg_emp;
        }else{
            checkEmpFlag++
            checkEmp[i].style.backgroundColor = nomalColor;
            errorEmpMsg[i].innerHTML = "";
        }
    }
    
    //チェック完了の印
    if(checkEmpFlag == checkEmp.length && checkNumFlag == 1 && checkDateFlag == 1){
        return "okay";
    }
}