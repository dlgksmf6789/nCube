import spidev   # spi communication module
import time # sleep
import serial   # serial communication module
import pynmea2  # to parse gps data
import gps

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
    data = ""
    if text.find('GGA') > 0:
        msg = pynmea2.parse(text)
        data = str(msg.lat)+str(msg.lat_dir)+","+str(msg.lon)+str(msg.lon_dir)
    return data
        #print("Lat: %s %s"%(msg.lat,msg.lat_dir))
        #print("Lon: %s %s"%(msg.lon,msg.lon_dir))

spi = spidev.SpiDev()
spi.open(0,0)   # SPICE0 port open
spi.max_speed_hz = 1000000  # max hz

gpsd = gps(mode=WATCH_ENABLE|WATCH_NEWSTYLE)

serialPort = serial.Serial("/dev/ttyAMA0", 9600, timeout=1)

waterLevel = 0
waterPressure = 1

#while True:

WL = analogRead(waterLevel)
WLV = Voltage3_3(WL)

WPV = Voltage3_3(analogRead(waterPressure))
#print(WPV)
WP = (WPV-WP_Offset) * 250

while True:
    GPS = serialPort.readline().decode('utf-8')
    addr = parseGps(GPS)
    if addr:
        print(addr)
    time.sleep(0.5)


#print(WL,',',WP,end='')
#print("WL Reading=%d\tVoltage=%f"%(WL,WLV))
#print("Water Pressure : %f"%(WP))
    
#time.sleep(1)
