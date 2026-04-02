# Real Aircraft Tracking Integration Guide

## Overview

The cargo tracking system now integrates with the **adsb.fi** free, open-source API to fetch real-time aircraft location data. This allows you to track pharmaceutical shipments with actual aircraft positions recorded by the ADS-B network.

## How to Use

### 1. Adding a Plane with Real Aircraft Data

When you select **"Plane"** as the vehicle type in the "Add Cargo Tracking" modal:

```
✈️ ICAO Code (6-digit hex) [input field]
   Example: 461E1A
```

The form requires you to enter the aircraft's ICAO code (6 hexadecimal characters).

### 2. Finding Aircraft ICAO Codes

Aircraft ICAO codes can be found from:

- **Flightradar24**: Look up any aircraft and find its ICAO in the details
- **ADS-B Exchange**: Browse live aircraft positions
- **Aviation databases**: Most aircraft databases include ICAO codes
- **Format**: 6 hexadecimal characters (e.g., 461E1A, 4CA0B0, 7C645D)

### 3. Real-Time Validation

As you type the ICAO code:

- ✅ **Valid format**: System queries adsb.fi API
- ✅ **Aircraft found**: Displays real-time data
  - Callsign (flight number)
  - Aircraft registration (tail number)
  - Current latitude/longitude
  - Altitude (feet)
  - Ground speed (knots)
- ❌ **Aircraft not tracked**: Shows "Aircraft location data unavailable"
  - Aircraft may be on ground, out of range, or not transmitting

### 4. Cargo Details Display

Once added, the cargo info dialog shows:

- **ICAO Code**: Linked aircraft identifier
- **Current Location**: Real coordinates from adsb.fi
- **Status**: In transit, delivered, or delayed
- **Cargo Contents**: Pharmaceutical inventory
- **Route**: Historical path of the aircraft

## Technical Details

### API Endpoint

```
GET /api/aircraft/[icao]
```

- **Request**: ICAO code (e.g., 461E1A)
- **Response**: Real-time aircraft data including position, altitude, speed, callsign, registration

### Data Source

- **Provider**: adsb.fi (free ADS-B Flight Tracking)
- **Base URL**: https://opendata.adsb.fi/api/v2
- **Coverage**: Global (focus on Europe/North America)
- **Update Frequency**: Every 5-10 seconds
- **Rate Limit**: 1 request/second (public API)

### ICAO Code Format

- **Length**: 6 characters (hexadecimal)
- **Case**: Insensitive (uppercase recommended)
- **Examples**:
  - 461E1A (Airbus A350)
  - 4CA0B0 (Boeing 787)
  - 7C645D (Airbus A220)
- **Validation**: Real-time format checking

### Response Data Structure

```json
{
  "success": true,
  "data": {
    "icao": "461E1A",
    "reg": "D-AXGG",
    "callsign": "DLH123",
    "lat": 51.5074,
    "lon": -0.1278,
    "alt_baro": 35000,
    "track": 245,
    "gs": 480,
    "seen": 2,
    "rssi": -25.5
  }
}
```

## Features

### Real-Time Location Tracking

- Automatically fetches current aircraft position from adsb.fi
- Updates on cargo creation
- Position accuracy depends on ADS-B receiver network coverage

### Validation & Error Handling

- Format validation (6 hex characters)
- Aircraft availability checking
- Graceful error messages if aircraft not found
- Form validation prevents submission without real data

### Integration with Cargo System

- ICAO code stored with cargo record
- Cargo info dialog displays aircraft identifier
- Real coordinates used for map visualization
- Supports future automatic location updates via polling

## Use Cases

### Pharmaceutical Supply Chain

1. **Export tracking**: Monitor drug shipments on international flights
2. **Route verification**: Confirm aircraft is on expected path
3. **Delay detection**: Identify if aircraft has been rerouted
4. **Compliance**: Document actual flight path for regulatory requirements

### Real-World Example

```
Scenario: Shipment of Paracetamol tablets from Germany to Sri Lanka

1. Enter aircraft ICAO: 461E1A (Airbus A350-900)
2. System fetches real data:
   - Current position: Over Middle East
   - Altitude: 43,000 feet
   - Speed: 490 knots
   - Callsign: LH789 (Lufthansa flight)
3. Cargo tracked with real location
4. Route displayed on map with actual waypoints
5. Info dialog shows aircraft details and time
```

## Limitations & Considerations

### Coverage

- Aircraft must be equipped with ADS-B transponder
- Receiver network coverage varies by region
- Some routes may have gaps in coverage
- Military/private aircraft may not broadcast

### Accuracy

- Position updates every 5-30 seconds (depends on receivers)
- Altitude accuracy ±200 feet typical
- Location accuracy ±100 meters in good coverage

### Data Policy

- For personal, non-commercial use only
- Must cite adsb.fi and link to their website
- No redistribution of raw data to third parties
- Data provided "as-is" without warranty

## Fallback Behavior

If an aircraft ICAO code cannot be found:

- User sees error message
- Cargo can still be added with default Sri Lankan location (Colombo)
- Used for ship tracking (doesn't require ICAO)
- Manual location entry can be added in future

## Future Enhancements

Potential improvements for the aircraft tracking system:

1. **Automatic Location Updates**: Periodically fetch aircraft position during transit
2. **Flight Plan Integration**: Show scheduled vs. actual route
3. **Aircraft Database**: Cached ICAO/registration for quick lookup
4. **Geo-Fencing**: Alerts when aircraft enters/leaves regions
5. **Weather Integration**: Show weather conditions along route
6. **Historical Routes**: Replay aircraft path over time
7. **Multi-aircraft Tracking**: Track multiple aircraft on same shipment (e.g., connecting flights)

## Troubleshooting

### "Aircraft location data unavailable"

- ✓ ICAO code format is correct
- ⚠️ Aircraft is not currently being tracked
- **Solution**: Check if aircraft is currently flying, try different ICAO code

### "ICAO code must be 6 hexadecimal characters"

- ❌ Format is incorrect
- **Solution**: Verify ICAO code is 6 characters (0-9, A-F), try uppercase

### Aircraft callsign not matching flight

- Some aircraft use multiple callsigns
- Callsign can change mid-flight
- Check registration (tail number) for confirmation

## Resources

- **Find ICAO Codes**: https://www.flightradar24.com
- **ADS-B Explorer**: https://globe.adsbexchange.com
- **adsb.fi Documentation**: https://github.com/adsbfi/opendata
- **Aircraft Registry**: https://www.ivao.aero/pages/pilot-guide.asp
