const expense=document.getElementById('expense');

expense.addEventListener('submit',async(e)=>{
    e.preventDefault();
    const amount=document.getElementById('amount');
    const description=document.getElementById('description');
    const category=document.getElementById('category');

    const expensedetails={
        amount:amount.value,
        description:description.value,
        category:category.value
    }
    try{

       await axios.post(`http://localhost:4000/expense/addexpense`,expensedetails,{
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        });

        let res=await fetchExpensesFromBackend(1);
        showuserexpense(res.data.expenses);
        addPagination(res.data);
        amount.value='';
        description.value='';
        
    }catch(err){
        if(err.response.status===501){

            amount.value="";
            console.log(err)
        }
       else{
        console.log(err);
       } 
    }
})

//*******/
async function fetchExpensesFromBackend(pageNo) {
    
    try {
        let rows = localStorage.getItem('rows');
        if(!rows) {
            rows = 5;
        }

        const response = await axios.get(`http://localhost:4000/expense/getexpense/?page=${pageNo}`, {
            headers: {
                'Authorization': localStorage.getItem('token'),
                'rows': rows
            }
        });

       
        return response;

    } catch (error) {
        console.log(error);
    }
}

//*******/

document.addEventListener("DOMContentLoaded", async () => {
    try {

      
        let response2=await fetchExpensesFromBackend(1);
        let response = response2.data.expenses;
       
            showuserexpense(response);
       
        addPagination(response2.data);
    }
    catch (err) {
        console.log(err);
    }
    checkforpremium();
})

function showuserexpense(user) {
    let item1= document.getElementById("expensetable2");
    item1.innerHTML="";
    user.forEach(item=>{
        let amount=Number(item.amount);
        let id=item._id;
        const date=new Date(item.createdAt);
    const day=date.getDate()+"-"+(date.getMonth()+1)+"-"+date.getFullYear();


    item1.innerHTML+=`
    <tr id="${item._id}">
        <td>${day}</td>
        <td>${item.amount}</td>
        <td>${item.description}</td>
        <td>${item.category}</td>
        <td><button value="${amount}" class='delete'>Delete</button></td>
    </tr>`


})
item1.addEventListener('click',removeItem);
}
let item = document.getElementById("expensetable2");


async function removeItem(e){
    
    if(e.target.classList.contains('delete')){
        let id = e.target.parentElement.parentElement.id;
        let amount = e.target.value;
        console.log("id="+id, "amount="+amount);
    await axios.delete(`http://localhost:4000/expense/deleteexpense/${id}/${amount}`,{
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        });
        let item = document.getElementById("expensetable2");
    item.removeChild(document.getElementById(`${id}`));
    }

}
document.getElementById('razorbutton').onclick= async(e)=>{
    try{

        let response = await axios.post(`http://localhost:4000/user/purchasepremium`, {}, {
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        });
        var options = {
            "key": response.data.key_id, // Enter the Key ID generated from the Dashboard
            // "name": "Test Company",
            "order_id": response.data.order.id, // For one time payment
           
            // This handler function will handle the success payment
            "handler": async function (response) {
                console.log(response);
                try{
              await  axios.post(`http://localhost:4000/user/purchasepremium/update-transaction-status`,
                    {
                        order_id: options.order_id,
                        payment_id: response.razorpay_payment_id,
                    }, 
                    {   
                        headers: {"Authorization" : localStorage.getItem('token')} 
                    })
                    
                        alert('You are a Premium User Now');
                        checkforpremium();
                 } catch(err)  {
                        alert('Something went wrong. Try Again!!!');
                    }
            }
        };

        const rzp = new Razorpay(options);
       rzp.open();
        e.preventDefault();

        rzp.on('payment.failed', function (response){
            console.log(response);
    
            alert(response.error.code);
            alert(response.error.description);
            alert(response.error.source);
            alert(response.error.step);
            alert(response.error.reason);
            alert(response.error.metadata.order_id);
            alert(response.error.metadata.payment_id);
        });
        
    }catch(err){
        console.log(err);
    }

}

   


async function checkforpremium(){
        try{
    let res=await axios.get("http://localhost:4000/user/checkmembership",{
        headers: {
            'Authorization': localStorage.getItem('token')
        }
    });
    if(res.status===200){
        document.getElementById('razorbutton').style.display="none";
        document.getElementById('primeuser').innerHTML="You are Premium User!";
        
        // showPreviousDownloads();
        return res;
    }
    else if(res.status===202){
        document.getElementById('primeuser').innerHTML='';
        return res;
    }
}catch(err){
    console.log(err);
    alert("something error occured");
    }
}


    

let leaderboard_btn=document.getElementById("leaderboard_btn");
    
    leaderboard_btn.onclick=async function addLeaderboard() {
    try {
        let res=await checkforpremium();
        if(res.status===200){
        document.getElementById('leaderboard-div').style.display = "block";
        document.getElementById('report').style.display='none';
        document.getElementById('expense-div').style.display='none';
        document.getElementById('expense-list').style.display='none';

        const response = await axios.get(`http://localhost:4000/expense/get-leaderboard`, {
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        });
        
        const leaderboard = document.getElementById('leaderboard');
       
        leaderboard.innerHTML = '';
        console.log(response.data);
        response.data.forEach(user => {
        
    
            leaderboard.innerHTML+=`
                <li id="${user.id}">${user.name}-${user.totalExpense}</li>
            `;
        })}
        else if(res.status===202){
            alert('Buy Premium Membership To Use This Feature')
        }
    } catch (error) {
        console.log('hello',error);
    }
}


   async function download(){
    try{
   let response=await axios.get(`http://localhost:4000/expense/download`, 
        { 
            headers: {"Authorization" : localStorage.getItem('token')} 
        }
    )
    
     if(response.status === 201){
            //the bcakend is essentially sending a download link
            //  which if we open in browser, the file would download
            // var a = document.createElement("a");
            // a.href = response.data.fileUrl;
            // a.download = 'myexpense.csv';
            // a.click();
            console.log(response.data.fileUrl);
        } else {
            throw new Error(response.data.message)
        }

    
}catch(err)  {
        console.log(err);  
    };
}



async function showPreviousDownloads() {
    try {
        const downloads = document.getElementById('downloads');
        const response = await axios.get(`http://localhost:4000/user/get-downloads`, {
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        });
    
        downloads.innerHTML = '';

        response.data.downloads.forEach(download => {
            downloads.innerHTML += `<li>
                <a href="${download.fileUrl}">${download.date}</a>
            </li>`;
        });

    } catch (error) {
        console.log(error);
    }
}



function addPagination(response) {
    const paginationDiv = document.querySelector('.pagination');
    paginationDiv.innerHTML = '';

    if(response.previousPage!==1 && response.currentPage!==1){
        paginationDiv.innerHTML += `
            <button>${1}</button>
        `;
        paginationDiv.innerHTML += '<<';
    }

    if(response.hasPreviousPage) {
        paginationDiv.innerHTML += `
            <button>${response.previousPage}</button>
        `;
    }

    paginationDiv.innerHTML += `
        <button class="active">${response.currentPage}</button>
    `;

    if(response.hasNextPage) {
        paginationDiv.innerHTML += `
            <button>${response.nextPage}</button>
        `;
    }

    if(response.currentPage !== response.lastPage && response.nextPage!==response.lastPage) {
        paginationDiv.innerHTML += '>>';
        paginationDiv.innerHTML += `
            <button>${response.lastPage}</button>
        `;
    }
}




document.querySelector('.pagination').onclick = async (e) => {
    e.preventDefault();

    const page = Number(e.target.innerHTML);

    const response = await fetchExpensesFromBackend(page);
    console.log(response);
    
    const expenses = response.data.expenses;

    showuserexpense(expenses);

    addPagination(response.data);
}

document.getElementById('row-selector').onchange = (e) => {
    
    e.preventDefault();
    
    localStorage.setItem('rows', e.target.value);

    window.location.reload();
}




const monthly1=document.getElementById('monthly1');
monthly1.addEventListener('submit',monthlyExpense);

async function monthlyExpense(e){
    e.preventDefault();
    let month=document.getElementById('month').value;
    let month1=new Date(month);
    let month2=month1.getMonth()+1;
    let year=month1.getFullYear();
    const monthDetails={
      month_: month2,
       year_:year
    }
try{
    let res=await axios.post(`http://localhost:4000/expense/monthexpense`,monthDetails,{
        headers: {
            'Authorization': localStorage.getItem('token')
        }
    });
    const monthly4=document.getElementById('monthly4');

    monthly4.innerHTML='';
    let total=0;
    res.data.forEach((item)=>{
       const date=new Date(item.createdAt);
       const day=date.getDate()+"-"+(date.getMonth()+1)+"-"+date.getFullYear();
       
   total+=item.amount;
       monthly4.innerHTML+=`<tr id="${item.id}">
      <td> ${day}</td>
      <td>${item.amount}</td>
      <td>${item.description}</td>
      <td>${item.category}</td>
      
       </tr>`
    })
    monthly4.innerHTML+=`<tr>
 <td></td>
 <td></td>
 <th></th>
 <th>Total:-${total}</th>`
   }
   catch(err){
   console.log('error',err);
   }
}




const daily1=document.getElementById('daily1');
daily1.addEventListener('submit',dailyExpense);

async function dailyExpense(e){
    e.preventDefault();
    let day=document.getElementById('day').value;
    let date=new Date(day);
    let day1=date.getDate();
    let month=date.getMonth()+1;
    let year=date.getFullYear();
    const dayDetails={
        day_:day1,
      month_: month,
       year_:year
    }
    // console.log(monthDetails);
try{
    let res=await axios.post(`http://localhost:4000/expense/dayexpense`,dayDetails,{
        headers: {
            'Authorization': localStorage.getItem('token')
        }
    });
 const daily4=document.getElementById('daily4');
 daily4.innerHTML='';
 let total=0;
 res.data.forEach((item)=>{
    const date=new Date(item.createdAt);
    const day=date.getDate()+"-"+(date.getMonth()+1)+"-"+date.getFullYear();
    // const month=;
    // const year=date.getFullYear();
    total+=item.amount;

    daily4.innerHTML+=`<tr id="${item.id}">
   <td> ${day}</td>
   <td>${item.amount}</td>
   <td>${item.description}</td>
   <td>${item.category}</td>
   
    </tr>`
 })
 daily4.innerHTML+=`<tr>
 <td></td>
 <td></td>
 <th></th>
 <th>Total:-${total}</th>`
 
//  document.getElementById('total2').innerHTML=total;

}
catch(err){
console.log('error',err);
}
}

function home(){
    // document.getElementById('expense-div').style.display='block';
    // document.getElementById('expense-list').style.display='block';
    // document.getElementById('leaderboard-div').style.display='none';
    // document.getElementById('report').style.display='none';
    window.location.reload();

}

async function report(){
    try{
        let res=await checkforpremium();
        if(res.status===200){
        document.getElementById('report').style.display='block';
        document.getElementById('expense-div').style.display='none';
        document.getElementById('expense-list').style.display='none';
        document.getElementById('leaderboard-div').style.display='none';
    }
    else if(res.status===202){
        alert('Buy Premium Membership To Use This Feature')
    }
}catch(err){
    console.log(err);
}
}