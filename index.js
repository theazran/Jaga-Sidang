/**=============================================
Please you don't remove!

Github    : https://github.com/theazran
Instagram : https://instagram.com/theazran_
Facebook  : https://facebook.com/theazran
Threads   : https://threads.net/theazran_
Saweria   : https://saweria.co/theazran
Blog      : https://azran.my.id

Bulukumba, Sulawesi Selatan, ID
================================================*/

const express = require('express');
const session = require('express-session');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const moment = require('moment');
require('moment/locale/id');

// Middleware express-session
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

// DB
const dbJadwalSidang = './db/jadwalSidang.json';
const dbPiketSidang = './db/piketSidang.json';
const dbDetailJadwalSidang = './db/detailJadwalSidang.json';
const config = JSON.parse(fs.readFileSync('./db/config.json'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

function checkAuth(req, res, next) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect('/login');
  }
}

app.get('/logout', (req, res) => {
  req.session.isAuthenticated = false;
  res.redirect('/');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find((user) => user.username === username && user.password === password);

  if (user) {
    req.session.isAuthenticated = true;
    res.redirect('/admin');
  } else {
    res.redirect('/login');
  }
});

app.get('/admin', checkAuth, (req, res) => {
  res.sendFile(__dirname + '/public/admin.html');
});


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Home
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Home v2
app.get('/v2', (req, res) => {
  res.sendFile(__dirname + '/public/v2.html');
});

function detilSidang(data) {
  const startIndex = data.indexOf("'") + 1;
  const endIndex = data.lastIndexOf("'");

  if (startIndex !== -1 && endIndex !== -1) {
    const extractedData = data.substring(startIndex, endIndex);
    return extractedData;
  }

  return null;
}

function readData() {
  try {
    const data = fs.readFileSync(dbDetailJadwalSidang, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read data from JSON file:', error);
    return [];
  }
}

app.get('/search', (req, res) => {
  const query = req.query.query;
  const data = readData();
  const searchResults = data.filter(item => {
    const lowerCaseQuery = query.toLowerCase();
    const lowerCaseNama = item.terdakwa.toLowerCase();
    const lowerCaseNomorPerkara = item.nomorPerkara.toLowerCase();
    return lowerCaseNama.includes(lowerCaseQuery) || lowerCaseNomorPerkara.includes(lowerCaseQuery);
  });

  res.json(searchResults);
});

app.get('/get', (req, res) => {
  axios.get(`${config[0].url}/list_jadwal_sidang/`)
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html);

      const dataArr = [];
      let counter = 1;

      $('table tr').each((index, element) => {
        if (index > 0) {
          const row = {};
          const columns = $(element).find('td');
          row['id'] = counter;
          row['Tanggal_Sidang'] = $(columns[1]).text().trim();
          row['Nomor_Perkara'] = $(columns[2]).text().trim();
          row['Sidang_Keliling'] = $(columns[3]).text().trim();
          row['Ruangan'] = $(columns[4]).text().trim();
          row['Agenda'] = $(columns[5]).text().trim();
          row['keterangan'] = "";
          row['completed'] = false;
          const detil = $(columns[6]).find('a').attr('onclick');
          
          if (detil) {
            row['Detil'] = detilSidang(detil);
          }

          dataArr.push(row);
          counter++;
        }
      });

      const dataJSON = JSON.stringify(dataArr, null, 2);
      fs.writeFile(dbJadwalSidang, dataJSON, err => {
        if (err) {
          console.log('Error writing to ' + dbJadwalSidang, err);
        } else {
          console.log('Data successfully written' + dbJadwalSidang);
        }
      });

      res.json(dataArr);
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

const fetchData = async (codeLinks) => {
  try {
    const response = await axios.get(`${config[0].url}/detil_jadwal_sidang/${codeLinks}`, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cookie': 'PHPSESSID=q02a84ohfbd47g3fb08q7eddf5; ci_session=a%3A12%3A%7Bs%3A10%3A%22session_id%22%3Bs%3A32%3A%229a76c8ca1a1b7b77bb22d4ae6e6b9860%22%3Bs%3A10%3A%22ip_address%22%3Bs%3A13%3A%22182.1.171.215%22%3Bs%3A10%3A%22user_agent%22%3Bs%3A111%3A%22Mozilla%2F5.0+%28Windows+NT+10.0%3B+Win64%3B+x64%29+AppleWebKit%2F537.36+%28KHTML%2C+like+Gecko%29+Chrome%2F114.0.0.0+Safari%2F537.36%22%3Bs%3A13%3A%22last_activity%22%3Bi%3A1688555612%3Bs%3A9%3A%22user_data%22%3Bs%3A0%3A%22%22%3Bs%3A8%3A%22asc_desc%22%3Bs%3A4%3A%22DESC%22%3Bs%3A4%3A%22sink%22%3Bs%3A27%3A%22Rabu%2C+05+Jul.+2023+14%3A26%3A02%22%3Bs%3A6%3A%22namapn%22%3Bs%3A27%3A%22PENGADILAN+NEGERI+BULUKUMBA%22%3Bs%3A8%3A%22alamatpn%22%3Bs%3A51%3A%22Jl.+Kenari+No+5+Kel.+Loka+Kec.+Ujung+Bulu+Bulukumba%22%3Bs%3A9%3A%22zonaWaktu%22%3Bs%3A4%3A%22WITA%22%3Bs%3A11%3A%22app_version%22%3Bs%3A5%3A%225.3.0%22%3Bs%3A15%3A%22jenispengadilan%22%3Bs%3A1%3A%221%22%3B%7D61993ca9c7330ce253b026c2f95684a71fdd0fc7',
        'Dnt': '1'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const nomorPerkara = $('#infoPerkara tr:nth-child(2) td:nth-child(2)').text().trim();
    const jenisPerkara = $('#infoPerkara tr:nth-child(3) td:nth-child(2)').text().trim();
    const terdakwa = $('#infoPerkara tr:nth-child(4) td:nth-child(2)').text().trim();
    const hariTanggalSidang = $('#infoPerkara tr:nth-child(6) td:nth-child(2)').text().trim();
    const jamSidang = $('#infoPerkara tr:nth-child(7) td:nth-child(2)').text().trim();
    const agenda = $('#infoPerkara tr:nth-child(8) td:nth-child(2)').text().trim();
    const sidangKeliling = $('#infoPerkara tr:nth-child(9) td:nth-child(2)').text().trim();
    const ruangSidang = $('#infoPerkara tr:nth-child(10) td:nth-child(2)').text().trim();

    const data = {
      nomorPerkara,
      jenisPerkara,
      terdakwa,
      hariTanggalSidang,
      jamSidang,
      agenda,
      sidangKeliling,
      ruangSidang
    };

    return data;
  } catch (error) {
    console.error('Error retrieving data:', error);
    return null;
  }
};

app.get('/getdetail', async (req, res) => {
  try {
    const jsonString = fs.readFileSync(dbJadwalSidang, 'utf8');
    const data = JSON.parse(jsonString);

    const results = [];

    for (let i = 0; i < data.length; i++) {
      const codeLinks = data[i].Detil;
      const result = await fetchData(codeLinks);

      if (result) {
        if (result.ruangSidang === "Sidang e-Litigasi") {
          result.completed = true;
        }

        results.push({ id: i + 1, ...result, keterangan: "" });
      }
    }

    fs.writeFile(dbDetailJadwalSidang, JSON.stringify(results, null, 2), (err) => {
      if (err) {
        console.error('Error saving results:', err);
        res.status(500).json({ error: 'Error saving results' });
      } else {
        console.log('Results saved to database ' + dbDetailJadwalSidang);
        res.json({ message: 'Results saved to ' + dbDetailJadwalSidang });
      }
    });
  } catch (err) {
    console.error('Error reading : ' + dbDetailJadwalSidang, err);
    res.status(500).json({ error: 'Error reading ' + dbDetailJadwalSidang });
  }
});

app.get('/todos', (req, res) => {
  fs.readFile(dbDetailJadwalSidang, 'utf8', (err, data) => {
    if (err) throw err;
    res.json(JSON.parse(data));
  });
});

app.post('/todos', (req, res) => {
  fs.readFile(dbDetailJadwalSidang, 'utf8', (err, data) => {
    if (err) throw err;
    const todos = JSON.parse(data);
    const newTodo = {
      id: todos.length + 1,
      task: req.body.task,
      keterangan: req.body.keterangan,
      completed: false
    };
    todos.push(newTodo);
    fs.writeFile(dbDetailJadwalSidang, JSON.stringify(todos), 'utf8', (err) => {
      if (err) throw err;
      res.redirect('/');
    });
  });
});

app.put('/todos/:id', (req, res) => {
  fs.readFile(dbDetailJadwalSidang, 'utf8', (err, data) => {
    if (err) throw err;
    const todos = JSON.parse(data);
    const todo = todos.find(todo => todo.id === parseInt(req.params.id));
    todo.completed = !todo.completed;
    fs.writeFile(dbDetailJadwalSidang, JSON.stringify(todos), 'utf8', (err) => {
      if (err) throw err;
      res.json(todo);
    });
  });
});

app.patch('/todos/:id', (req, res) => {
  fs.readFile(dbDetailJadwalSidang, 'utf8', (err, data) => {
    if (err) throw err;
    const todos = JSON.parse(data);
    const todo = todos.find(todo => todo.id === parseInt(req.params.id));
    todo.keterangan = req.body.keterangan;
    fs.writeFile(dbDetailJadwalSidang, JSON.stringify(todos), 'utf8', (err) => {
      if (err) throw err;
      res.sendStatus(200);
    });
  });
});

app.delete('/todos/:id', (req, res) => {
  fs.readFile(dbDetailJadwalSidang, 'utf8', (err, data) => {
    if (err) throw err;
    const todos = JSON.parse(data);
    const index = todos.findIndex(todo => todo.id === parseInt(req.params.id));
    todos.splice(index, 1);
    fs.writeFile(dbDetailJadwalSidang, JSON.stringify(todos), 'utf8', (err) => {
      if (err) throw err;
      res.sendStatus(200);
    });
  });
});

const todosData = fs.readFileSync(dbDetailJadwalSidang);
const detailData = fs.readFileSync(dbJadwalSidang);

const todos = JSON.parse(todosData);
const detail = JSON.parse(detailData);

function getAllDetailData() {
  const allDetailData = todos.map(todo => {
    const detailInfo = detail.find(info => info.nomorPerkara === todo.Nomor_Perkara);

    if (detailInfo) {
      return {
        id: todo.id,
        tanggalSidang: todo.Tanggal_Sidang,
        nomorPerkara: todo.Nomor_Perkara,
        sidangKeliling: todo.Sidang_Keliling,
        jenisPerkara: detailInfo.jenisPerkara,
        agenda: todo.Agenda,
        keterangan: todo.keterangan,
        completed: todo.completed,
        detail: todo.Detil,
        terdakwa: detailInfo.terdakwa,
        jamSidang: detailInfo.jamSidang,
        ruangSidang: detailInfo.ruangSidang
      };
    }

    return null;
  });

  return allDetailData.filter(detailData => detailData !== null);
}

const saveDataToJson = (data) => {
  fs.writeFile(dbDetailJadwalSidang, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error('Error saving data:', err);
    } else {
      console.log('Data saved to ... result.json');
    }
  });
};

app.get('/detail', (req, res) => {
  const allDetailData = getAllDetailData();
  saveDataToJson(allDetailData);
  res.json(allDetailData);
});

function getHari() {
  const hariList = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const today = new Date();
  const hari = hariList[today.getDay()];
  return hari;
}

app.get('/piket-sidang', (req, res) => {
  fs.readFile(dbPiketSidang, 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    const jadwal = JSON.parse(data);
    const hari = getHari();
    const jadwalHariIni = jadwal[hari];

    if (!jadwalHariIni) {
      res.status(404).json({ error: 'Jadwal tidak tersedia untuk hari ini' });
      return;
    }

    res.json(jadwalHariIni);
  });
});


app.listen(3000, () => {
  console.log('Running!');
});
