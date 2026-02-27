/**
 * Round Entry Master - Google Apps Script Backend
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet
 * 2. Add two sheets: "Rounds" and "Shots"
 * 3. Add headers to each sheet (see below)
 * 4. Extensions > Apps Script
 * 5. Paste this code
 * 6. Set SPREADSHEET_ID below
 * 7. Deploy as Web App (Execute as: Me, Anyone)
 * 8. Copy the /exec URL to your app's .env file
 * 
 * ROUNDS SHEET HEADERS (Row 1):
 * round_id, player_name, date, course_name, tournament, holes, course_difficulty, weather, client_id, app_version, submitted_at
 * 
 * SHOTS SHEET HEADERS (Row 1):
 * shot_id, round_id, hole_number, shot_number, start_lie, start_distance, start_unit, end_lie, end_distance, end_unit, penalty, holed, non_driver_tee_shot, putt_leave
 */

// ===== CONFIGURATION =====
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Replace with your spreadsheet ID

// ===== UTILITY FUNCTIONS =====

function doPost(e) {
  try {
    // Parse the JSON payload
    const payload = JSON.parse(e.postData.contents);
    const { round, shots, replaceExisting } = payload;
    
    // Validate required data
    if (!round) {
      return createErrorResponse('Round data is required', 'MISSING_ROUND');
    }
    
    if (!shots || !Array.isArray(shots) || shots.length === 0) {
      return createErrorResponse('Shots array is required and cannot be empty', 'MISSING_SHOTS');
    }
    
    // Open the spreadsheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const roundsSheet = ss.getSheetByName('Rounds');
    const shotsSheet = ss.getSheetByName('Shots');
    
    if (!roundsSheet || !shotsSheet) {
      return createErrorResponse('Sheets not found. Please ensure Rounds and Shots sheets exist.', 'SHEET_NOT_FOUND');
    }
    
    // Check for duplicate round (unless replaceExisting is true)
    if (!replaceExisting) {
      const existingRound = findRoundById(roundsSheet, round.roundId);
      if (existingRound) {
        return createErrorResponse('Round already exists. Use replaceExisting=true to update.', 'DUPLICATE_ROUND');
      }
    }
    
    // If replacing, delete existing round and shots
    if (replaceExisting) {
      deleteRoundAndShots(roundsSheet, shotsSheet, round.roundId);
    }
    
    // Validate shots data
    const validationError = validateShots(shots, round.holes);
    if (validationError) {
      return createErrorResponse(validationError.message, validationError.code);
    }
    
    // Append round data
    const submittedAt = new Date().toISOString();
    const roundRow = appendRound(roundsSheet, round, submittedAt);
    
    // Batch append shots
    const shotsInserted = appendShots(shotsSheet, round.roundId, shots);
    
    // Return success
    return createSuccessResponse(round.roundId, roundRow, shotsInserted, submittedAt);
    
  } catch (error) {
    return createErrorResponse('Server error: ' + error.message, 'SERVER_ERROR');
  }
}

function findRoundById(sheet, roundId) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const roundIdCol = headers.indexOf('round_id');
  
  if (roundIdCol === -1) return null;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][roundIdCol] === roundId) {
      return data[i];
    }
  }
  return null;
}

function deleteRoundAndShots(roundsSheet, shotsSheet, roundId) {
  // Delete shots
  const shotsData = shotsSheet.getDataRange().getValues();
  const shotsHeaders = shotsData[0];
  const roundIdCol = shotsHeaders.indexOf('round_id');
  
  if (roundIdCol !== -1) {
    const rowsToDelete = [];
    for (let i = 1; i < shotsData.length; i++) {
      if (shotsData[i][roundIdCol] === roundId) {
        rowsToDelete.push(i + 1);
      }
    }
    // Delete in reverse order to maintain row numbers
    for (let i = rowsToDelete.length - 1; i >= 0; i--) {
      shotsSheet.deleteRow(rowsToDelete[i]);
    }
  }
  
  // Delete round
  const roundsData = roundsSheet.getDataRange().getValues();
  const roundsHeaders = roundsData[0];
  const roundIdCol = roundsHeaders.indexOf('round_id');
  
  if (roundIdCol !== -1) {
    for (let i = 1; i < roundsData.length; i++) {
      if (roundsData[i][roundIdCol] === roundId) {
        roundsSheet.deleteRow(i + 1);
        break;
      }
    }
  }
}

function validateShots(shots, totalHoles) {
  // Check hole bounds
  for (const shot of shots) {
    if (shot.holeNumber < 1 || shot.holeNumber > totalHoles) {
      return { message: `Invalid hole number: ${shot.holeNumber}. Must be between 1 and ${totalHoles}`, code: 'INVALID_HOLE' };
    }
  }
  
  // Check exactly one holed per hole
  const holedByHole = {};
  for (const shot of shots) {
    if (shot.holed) {
      holedByHole[shot.holeNumber] = (holedByHole[shot.holeNumber] || 0) + 1;
    }
  }
  
  for (const holeNum in holedByHole) {
    if (holedByHole[holeNum] !== 1) {
      return { message: `Hole ${holeNum} must have exactly one holed shot, found ${holedByHole[holeNum]}`, code: 'INVALID_HOLED' };
    }
  }
  
  // Check first shot is from Tee
  for (const shot of shots) {
    if (shot.shotNumber === 1 && shot.startLie !== 'Tee') {
      return { message: `Hole ${shot.holeNumber} first shot must start from Tee`, code: 'INVALID_START_LIE' };
    }
  }
  
  return null;
}

function appendRound(sheet, round, submittedAt) {
  const values = [
    round.roundId,
    round.playerName,
    round.date,
    round.courseName,
    round.tournament,
    round.holes,
    round.courseDifficulty,
    round.weather,
    round.clientId,
    round.appVersion,
    submittedAt
  ];
  
  sheet.appendRow(values);
  return sheet.getLastRow();
}

function appendShots(sheet, roundId, shots) {
  const batch = shots.map(shot => [
    shot.shotId,
    roundId,
    shot.holeNumber,
    shot.shotNumber,
    shot.startLie,
    shot.startDistance,
    shot.startUnit,
    shot.endLie,
    shot.endDistance,
    shot.endUnit,
    shot.penalty ? 'TRUE' : 'FALSE',
    shot.holed ? 'TRUE' : 'FALSE',
    shot.nonDriverTeeShot ? 'TRUE' : 'FALSE' || '',
    shot.puttLeave || ''
  ]);
  
  sheet.getRange(sheet.getLastRow() + 1, 1, batch.length, batch[0].length).setValues(batch);
  return batch.length;
}

function createSuccessResponse(roundId, roundRow, shotsInserted, submittedAt) {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      roundId: roundId,
      roundRow: roundRow,
      shotsInserted: shotsInserted,
      submittedAt: submittedAt
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function createErrorResponse(error, code) {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: false,
      error: error,
      code: code
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== DEBUG FUNCTION =====
function testConnection() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: 'GAS backend is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}
