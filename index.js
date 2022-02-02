
const express = require('express');
const fs = require('fs'); 
var mysql = require('mysql');
var sqlite3 = require('sqlite3');

const app = express();
app.listen(3000,()=>console.log('We are live!')) // port 3000
app.use(express.static('public')); // render public folder on server, by default we render index.html
app.use(express.json())


var con = mysql.createConnection({
    user:'root', password:'5@m@y!nF0tech',
    host:'3.109.4.207',
    database:'SamayAgriTech'
  });


function convertGMTtoIST(objDate) {
  // converts GMT to IST (adds 5 hrs 30 mins to input datetime)
  // 'subtractTimeFromDate' from: https://code.tutsplus.com/tutorials/how-to-add-and-subtract-time-from-a-date-in-javascript--cms-37207
  var numberOfMlSeconds = objDate.getTime();
  var addMlSeconds = (5 * 60) * 60 * 1000 + 30* 60 * 1000; // add 5 hrs 30 mins in milliseconds
  var newDateObj = new Date(numberOfMlSeconds + addMlSeconds);

  return newDateObj;
}

  sensor_name_dict={ 'Rain':['customer_sensor_datacapture_ENV_Rain','RainStatus'],
  'Light':['customer_sensor_datacapture_Env_Light','lightreading'],
    'Temperature':['customer_sensor_datacapture_Env_TH','humidity','temp'], // *** Temp has 2 readings
    'Air':['customer_sensor_datacapture_GAS_Air','airsensor'],
    'Mositure':['customer_sensor_datacapture_SOIL_Moisture','SoilMoisture']
  } 

  app.post('/api',(request,response)=>  {
  
    const sensor_code=sensor_name_dict[request.body.sensor_name][0] //const is imporatant!
    const sql_varname=sensor_name_dict[request.body.sensor_name][1]
    console.log('sensor request',sensor_code,sql_varname)

    let sql = `SELECT MAX(capturetimestamp) FROM ${sensor_code}`
    con.query(sql, (error, results0, fields) => {
      if (error) { return console.error('sql error',error.message)}
      console.log('max result',results0)
      console.log('direct',results0[0]['MAX(capturetimestamp)'],new Date(results0[0]['MAX(capturetimestamp)']))
      max_date = convertGMTtoIST(new Date(results0[0]['MAX(capturetimestamp)']))
      console.log('max_date1',max_date,convertGMTtoIST(max_date),convertGMTtoIST(results0[0]['MAX(capturetimestamp)']))
      month = max_date.getMonth()+1 // .getMonth() returns a zero-based number so to get the correct month you need to add 1(DUMB!),: https://stackoverflow.com/questions/10211145/getting-current-date-and-time-in-javascript
      console.log('max_data-extract',max_date.getFullYear(),max_date.getMonth(), max_date.getDate())
      max_date=max_date.getFullYear()+"-"+month+"-"+max_date.getDate()
    
      console.log('max_date2',max_date)

      


      let sql_2 = `SELECT * FROM ${sensor_code} WHERE capturetimestamp >= '${max_date.toString()}'`
      console.log('sql last day command',sql_2)
      con.query(sql_2, (error, results, fields) => {
      if (error) { return console.error('sql error',error.message)}

      console.log('l',results.length)
      console.log('sqresults',results[0],results[0][sql_varname])
      // console.log(results)
      results=results.reverse() // from newest to oldest
    
      data_list=[]
      timestamp_list=[]
  
      maxi=results.length
      for (let i = 0; i < maxi; i++) {
        try {
          data_list.push(results[i][sql_varname])
          timestamp_list.push(results[i]['capturetimestamp'])
        } 
        catch(err) {console.log('-------error list',results[i])}
        
  
      }
      response.send(JSON.stringify({'data_list':data_list,'timestamp_list':timestamp_list} ))
  
    })
  })
})
  
  
  
  
  
app.post('/filtered_dates',(request,response)=>  {

  console.log('/filtered_dates',request.body)
  start_date=request.body.start_date
  end_date=request.body.end_date
  const sensor_code=sensor_name_dict[request.body.sensor_name][0]
  const sql_varname=sensor_name_dict[request.body.sensor_name][1]

  console.log('Dates to filter backend',start_date,end_date)
  let sql = `SELECT * FROM ${sensor_code} WHERE capturetimestamp >= '${start_date}' and capturetimestamp <= '${end_date}'`
  console.log('SQL Query /filtered_dates',sql)
  con.query(sql, (error, results, fields) => {
    if (error) {
      return console.error('sql error',error.message)}
    
   
    console.log(results.length)
    console.log('sqresults',results[0],results[0][sql_varname])
    // console.log(results)           
    results=results.reverse() // from newest to oldest
  
    data_list=[]
    timestamp_list=[]

    maxi=results.length
    for (let i = 0; i < maxi; i++) {
      try {
        data_list.push(results[i][sql_varname])
        timestamp_list.push(results[i]['capturetimestamp'])
      } 
      catch(err) {console.log('-------error list',results[i])}
      

    }
    response.send(JSON.stringify({'data_list':data_list,'timestamp_list':timestamp_list} ))

  })
})




app.post('/get_latest',(request,response)=>  {
  
  const sensor_code=sensor_name_dict[request.body.sensor_name][0] //const is imporatant!
  const sql_varname=sensor_name_dict[request.body.sensor_name][1]
  console.log('sensor request',sensor_code,sql_varname)

  let sql = `SELECT MAX(capturetimestamp) FROM ${sensor_code}`
  con.query(sql, (error, results0, fields) => {
    if (error) { return console.error('sql error',error.message)}
    console.log('------------get_latest ')
    console.log('max result',results0)
    console.log('direct',results0[0]['MAX(capturetimestamp)'],new Date(results0[0]['MAX(capturetimestamp)']))
    max_date = convertGMTtoIST(new Date(results0[0]['MAX(capturetimestamp)']))
    console.log('max_date1',max_date,convertGMTtoIST(max_date),convertGMTtoIST(results0[0]['MAX(capturetimestamp)']))
    month = max_date.getMonth()+1 // .getMonth() returns a zero-based number so to get the correct month you need to add 1(DUMB!),: https://stackoverflow.com/questions/10211145/getting-current-date-and-time-in-javascript
    console.log('max_data-extract',max_date.getFullYear(),max_date.getMonth(), max_date.getDate())
    max_date=max_date
  
    console.log('max_date2',max_date)

    


    let sql_2 = `SELECT * FROM ${sensor_code} WHERE capturetimestamp = '${max_date.toString()}'`
    console.log('sql last day command',sql_2)
    con.query(sql_2, (error, results, fields) => {
    if (error) { return console.error('sql error',error.message)}

    console.log('---l',results.length)
    console.log('---sqresults',results,results[0][sql_varname])
    // console.log(results)
    results=results.reverse() // from newest to oldest
  
    data_list=[]
    timestamp_list=[]

    maxi=results.length
    for (let i = 0; i < maxi; i++) {
      try {
        data_list.push(results[i][sql_varname])
        timestamp_list.push(results[i]['capturetimestamp'])
      } 
      catch(err) {console.log('-------error list',results[i])}
      

    }
    response.send(JSON.stringify({'data_list':data_list,'timestamp_list':timestamp_list} ))

  })
})
})