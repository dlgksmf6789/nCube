import spidev   # spi communication module
import time # sleep
import serial   # serial communication module
import pynmea2  # to parse gps data

GPS_Latitude = 0
GPS_Longitude = 0
WP_Offset = 0.302

def Voltage3_3(value):
    return value*3.3 / 1024

def analogRead(channel):
    rd = spi.xfer2([1, (8+channel) << 4, 0])
    adc_out = ((rd[1]&3) << 8) + rd[2]
    return adc_out

def parseGps(text):
    data = list()
    if text.find(b'GGA') > 0:
        msg = pynmea2.parse(text.decode('utf-8'))
        data = [co_cal(str(msg.lat)), co_cal(str(msg.lon))]
    return data

def co_cal(addr):
    addr = float(addr)
    deg = addr // 100
    min = (addr % 100) / 60
    return str(deg+min)

spi = spidev.SpiDev()
spi.open(0,0)   # SPICE0 port open
spi.max_speed_hz = 1000000  # max hz

serialPort = serial.Serial("/dev/ttyAMA0", 9600, timeout=0.5)

waterLevel = 0
waterPressure = 1

WL = analogRead(waterLevel)
WLV = Voltage3_3(WL)

WPV = Voltage3_3(analogRead(waterPressure))
WP = (WPV-WP_Offset) * 250

while True:
    GPS = serialPort.readline() #.decode('utf-8')
    addr = parseGps(GPS)
    if len(addr):
        break
    time.sleep(0.5)

lat = addr[0]
lon = addr[1]
print(lat,',',lon,',',WL,',',WP,end='')
