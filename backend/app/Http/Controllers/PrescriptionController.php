$validator = Validator::make($request->all(), [
        'patient_id' => 'required|exists:patient,id',  // Changed to match the actual table name
        'medication' => 'required|string|max:255',
        'dosage' => 'required|string|max:100',
        'frequency' => 'required|string|in:once_daily,twice_daily,thrice_daily',
        'duration' => 'required|numeric|min:1',
        'instructions' => 'required|string|in:before_meal,after_meal',
    ]);