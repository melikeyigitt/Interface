// Kontrol Paneli menüsünü göster
function showControlPanel() {
    document.getElementById("control-panel").style.display = "block";
    document.getElementById("mission-panel").style.display = "none";
    document.getElementById("durum-panel").style.display = "none";
    document.getElementById("service-action-panel").style.display = "none"; // Ekledim
    document.getElementById("map-panel").style.display = "none"; // Ekledim
}

// Görev Paneli menüsünü göster
function showMissionPanel() {
    document.getElementById("control-panel").style.display = "none";
    document.getElementById("mission-panel").style.display = "block";
    document.getElementById("durum-panel").style.display = "none";
    document.getElementById("service-action-panel").style.display = "none"; // Ekledim
    document.getElementById("map-panel").style.display = "none"; // Ekledim
}

// Durum Paneli menüsünü göster
function showDurumPanel() {
    document.getElementById("control-panel").style.display = "none";
    document.getElementById("mission-panel").style.display = "none";
    document.getElementById("durum-panel").style.display = "block";
    document.getElementById("service-action-panel").style.display = "none"; // Ekledim
    document.getElementById("map-panel").style.display = "none"; // Ekledim
}

// Servisler ve Aksiyonlar menüsünü göster
function showServiceActionMenu() {
    document.getElementById("control-panel").style.display = "none";
    document.getElementById("mission-panel").style.display = "none";
    document.getElementById("durum-panel").style.display = "none";
    document.getElementById("service-action-panel").style.display = "block";
    document.getElementById("map-panel").style.display = "none"; // Ekledim
}

// Harita Paneli menüsünü göster
function showMapPanel() {
    document.getElementById("control-panel").style.display = "none";
    document.getElementById("mission-panel").style.display = "none";
    document.getElementById("durum-panel").style.display = "none";
    document.getElementById("service-action-panel").style.display = "none";
    document.getElementById("map-panel").style.display = "block";
}

// ROS bağlantısı oluşturuluyor
const ros = new ROSLIB.Ros({
    url: "ws://localhost:9090"
});

// Akımlar konusuna abone ol
var akimlarSub = new ROSLIB.Topic({
    ros: ros,
    name: '/akimlar',
    messageType: 'std_msgs/Float64MultiArray'
});

// Akımlar tablosu içeriği
var akimlarTabloIcerik = document.getElementById('akimlar-tablo-icerik');

akimlarSub.subscribe(function(message) {
    // Gelen mesajı al ve tabloya ekle
    var akimlar = message.data;
    var row = '<tr>';
    row += '<td>' + 1 + '</td>';
    for (var i = 0; i < akimlar.length; i++) {
        row += '<td>' + akimlar[i] + '</td>';
    }
    row += '</tr>';
    akimlarTabloIcerik.innerHTML = row;
});

// Korna fonksiyonu
function honkHorn() {
    // Korna butonuna basıldığında /korna_role konusuna 1 değeri gönder
    var kornaTopic = new ROSLIB.Topic({
        ros: ros,
        name: '/korna_role',
        messageType: 'std_msgs/Int32'
    });
    var message = new ROSLIB.Message({
        data: 1
    });
    kornaTopic.publish(message);
}

// Hareket komutlarını yayınlayacak fonksiyon
function publishCmdVel(linearX, linearY, linearZ, angularX, angularY, angularZ) {
    var cmdVelTopic = new ROSLIB.Topic({
        ros: ros,
        name: '/cmd_vel',
        messageType: 'geometry_msgs/Twist'
    });

    var twist = new ROSLIB.Message({
        linear: {
            x: linearX,
            y: linearY,
            z: linearZ
        },
        angular: {
            x: angularX,
            y: angularY,
            z: angularZ
        }
    });

    cmdVelTopic.publish(twist);
}

// Servis çağrısı yapacak fonksiyon
function call_turn_angle_w_camera() {
    // Gerekli girdileri al

    var direction = document.getElementById("direction").value;
    var angularVelocity = parseFloat(document.getElementById("angular-velocity").value);
    var afterTurn = document.getElementById("after-turn").checked;

    // Servis çağrısı için gerekli bilgiler
    var serviceCall = new ROSLIB.Service({
        ros: ros,
        name: '/turn_angle_w_camera',
        serviceType: 'setan_v1_interfaces/srv/TurnAngleSrv'
    });

    // Servis çağrısı için gerekli parametreler
    var request = new ROSLIB.ServiceRequest({

        direction: direction,
        angular_velocity: angularVelocity,
        after_turn: afterTurn
    });

    // Servis çağrısı yap
    serviceCall.callService(request, function(result) {
        console.log('Servis çağrısı sonucu: ', result);
    });
}

// Hareketi durduracak fonksiyon
function stopMove() {
    // Hareketi durdur
    clearInterval(moveInterval);
    // Durma mesajı gönder
    publishCmdVel(0, 0, 0, 0, 0, 0);
}

// Hareketi başlatacak fonksiyon
function startMove(linearX, linearY, linearZ, angularX, angularY, angularZ) {
    // Belirli bir süre aralığında sürekli olarak cmd_vel mesajı yayınla
    moveInterval = setInterval(function() {
        publishCmdVel(linearX, linearY, linearZ, angularX, angularY, angularZ);
    }, 100); // Her 100 milisaniyede bir yayın yap
}

function sendLinearMotorService(state) {
    // Servis çağrısı için gerekli bilgiler
    var serviceCall = new ROSLIB.Service({
        ros: ros,
        name: '/linear_motor_service', // Servis adı
        serviceType: 'robot_bringup/LinearMotorService' // Servis tipi
    });

    // Servis çağrısı için gerekli parametreler
    var request = new ROSLIB.ServiceRequest({
        state: state // Durum parametresi
    });

    // Servis çağrısı yap
    serviceCall.callService(request, function(result) {
        console.log('Lineer motor servis çağrısı sonucu: ', result);
    });
}

// ROS Topic (Konu) tanımlaması ve abonelik
var tablaYukseklikSub = new ROSLIB.Topic({
    ros: ros,
    name: 'tabla_yukseklik',
    messageType: 'std_msgs/Float64'
});

tablaYukseklikSub.subscribe(function (message) {
    // Gelen mesajı HTML label'a yerleştir
    var messageLabel = document.getElementById('message_label');
    messageLabel.textContent = 'Tabla Yükseklik: ' + message.data;
});

// ROS Topic (Konu) tanımlaması ve abonelik
var qr_code = new ROSLIB.Topic({
    ros: ros,
    name: 'qr',
    messageType: 'std_msgs/String'
});

qr_code.subscribe(function (message) {
    // Gelen mesajı HTML label'a yerleştir
    var messageLabel = document.getElementById('qr_code');
    messageLabel.textContent = message.data;
});


//--------------------------test
function addNewCircle() {
    // Kullanıcıdan girdileri al
    var newX = parseInt(document.getElementById("x-coordinate").value);
    var newY = parseInt(document.getElementById("y-coordinate").value);
    var newRadius = parseInt(document.getElementById("radius").value);

    // Güvenlik kontrolleri yap
    if (isNaN(newX) || isNaN(newY) || isNaN(newRadius)) {
        alert("Geçerli bir sayı giriniz.");
        return;
    }

    // Yeni çemberi oluştur
    var newCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

    // Yeni çemberin özelliklerini belirt
    newCircle.setAttribute("cx", newX);
    newCircle.setAttribute("cy", newY);
    newCircle.setAttribute("r", newRadius);
    newCircle.setAttribute("fill", "red"); // Örneğin yeni çemberin rengini kırmızı olarak ayarladık
    newCircle.setAttribute("opacity", "1.0");

    // SVG içerisine yeni çemberi ekle
    var svg = document.getElementById("map-overlay");
    svg.appendChild(newCircle);
}
function addTextToMap() {
    // Kullanıcıdan girdileri al
    var x = parseInt(document.getElementById("x-coordinate_for_text").value);
    var y = parseInt(document.getElementById("y-coordinate_for_text").value);
    var text = document.getElementById("text_for_text").value;

    // Kontrol yaparak, inputların boş veya geçersiz olup olmadığını kontrol et
    if (isNaN(x) || isNaN(y) || !text) {
        alert("Geçersiz giriş! Lütfen geçerli bir sayı ve metin giriniz.");
        return;
    }

    // Yeni bir metin öğesi oluştur
    var newText = document.createElementNS("http://www.w3.org/2000/svg", "text");

    // Metnin özelliklerini belirt
    newText.setAttribute("x", x);
    newText.setAttribute("y", y);
    newText.setAttribute("fill", "black"); // Metnin rengini beyaz olarak ayarladık, dilediğiniz rengi seçebilirsiniz
    newText.setAttribute("font-size", "16"); // Metnin boyutunu 16 olarak ayarladık, dilediğiniz boyutu seçebilirsiniz
    newText.textContent = text; // Metnin içeriğini belirtilen metin olarak ayarladık

    // SVG içerisine yeni metni ekle
    var svg = document.getElementById("map-overlay");
    svg.appendChild(newText);
}
function addRectangleToMap() {
    // Kullanıcıdan girdileri al
    var x = parseInt(document.getElementById("x-coordinate_rect").value);
    var y = parseInt(document.getElementById("y-coordinate_rect").value);
    var width = parseInt(document.getElementById("rect-width").value);
    var height = parseInt(document.getElementById("rect-height").value);

    // Güvenlik kontrolleri yap
    if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
        alert("Geçersiz giriş! Lütfen geçerli bir sayı giriniz.");
        return;
    }

    // Yeni bir dikdörtgen oluştur
    var newRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");

    // Dikdörtgenin özelliklerini belirt
    newRect.setAttribute("x", x);
    newRect.setAttribute("y", y);
    newRect.setAttribute("width", width);
    newRect.setAttribute("height", height);
    newRect.setAttribute("fill", "blue"); // Örneğin dikdörtgenin rengini mavi olarak ayarladık
    newRect.setAttribute("opacity", "0.7"); // Örneğin dikdörtgenin opaklığını %70 olarak ayarladık

    // SVG içerisine yeni dikdörtgeni ekle
    var svg = document.getElementById("map-overlay");
    svg.appendChild(newRect);
}
//--------------------------test

// ROS Topic (Konu) tanımlaması ve abonelik
var sub_robot = new ROSLIB.Topic({
    ros: ros,
    name: '/sim_to_map',
    messageType: 'std_msgs/Int32MultiArray'
});

sub_robot.subscribe(function (message) {
    // Gelen mesajı ayrıştır
    var data = message.data;
    var x = data[0];
    var y = data[1];
    var width = data[2];
    var height = data[3];
    var colorCode = data[4];

    // Renk koşulunu kontrol et ve renk belirle
    var color;
    if (colorCode === 0) {
        color = "blue"; // Yol
    } else if (colorCode === 1) {
        color = "red"; // Engel
    } else {
        color = "black"; // Diğer durumlar için varsayılan renk
    }

    // Dikdörtgeni çiz
    drawRectangle(x, y, width, height, color);
});

// Dikdörtgeni çizmek için fonksiyon
function drawRectangle(x, y, width, height, color) {
    var svg = document.getElementById("map-overlay");

    // Yeni bir dikdörtgen oluştur
    var newRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");

    // Dikdörtgenin özelliklerini belirt
    newRect.setAttribute("x", x);
    newRect.setAttribute("y", y);
    newRect.setAttribute("width", width);
    newRect.setAttribute("height", height);
    newRect.setAttribute("fill", color); // Renk
    newRect.setAttribute("opacity", "0.7"); // Opaklık

    // SVG içerisine yeni dikdörtgeni ekle
    svg.appendChild(newRect);
}

// ROS Topic (Konu) tanımlaması ve abonelik
var sub_qr = new ROSLIB.Topic({
    ros: ros,
    name: '/sim_to_map_qr',
    messageType: 'std_msgs/String' // Veri tipi String olarak değiştirildi
});

sub_qr.subscribe(function (message) {
    // Gelen mesajı ayır qr15,15,150
    var qr_data = message.data;
    var qr_values = qr_data.split(",");

    // Ayırılan veriyi text, px ve py olarak ayır
    var text = qr_values[0];
    var px = parseInt(qr_values[1]);
    var py = parseInt(qr_values[2]);

    // Metni haritaya ekle
    addQrToMap(px, py, text);
});

function addQrToMap(x, y, text) {
    // Yeni bir metin öğesi oluştur
    var newText = document.createElementNS("http://www.w3.org/2000/svg", "text");

    // Metnin özelliklerini belirt
    newText.setAttribute("x", x);
    newText.setAttribute("y", y);
    newText.setAttribute("fill", "black"); // Metnin rengini siyah olarak ayarla, istediğiniz rengi seçebilirsiniz
    newText.setAttribute("font-size", "16"); // Metnin boyutunu 16 olarak ayarla, istediğiniz boyutu seçebilirsiniz
    newText.textContent = text; // Metnin içeriğini belirtilen metin olarak ayarla

    // SVG içine yeni metni ekle
    var svg = document.getElementById("map-overlay");
    svg.appendChild(newText);
}

function startBosTurService() {
    // Kullanıcıdan path ve robot_yon verilerini al
    var path = document.getElementById("path").value;
    var robotYon = parseInt(document.getElementById("robot_yon").value);

    // ROS bağlantısı oluşturuluyor
    const ros = new ROSLIB.Ros({
        url: "ws://localhost:9090"
    });

    // Servis çağrısı için gerekli bilgiler
    var serviceCall = new ROSLIB.Service({
        ros: ros,
        name: '/bos_tur_server',
        serviceType: 'robot_bringup/BosTurService'
    });

    // Servis çağrısı için gerekli parametreler
    var request = new ROSLIB.ServiceRequest({
        start: true,
        path: path,
        robot_yon: robotYon
    });

    // Servis çağrısı yap
    serviceCall.callService(request, function(result) {
        console.log('Servis çağrısı sonucu: ', result);
        // Servis çağrısı sonucunu işleyebilirsiniz
    });
}
