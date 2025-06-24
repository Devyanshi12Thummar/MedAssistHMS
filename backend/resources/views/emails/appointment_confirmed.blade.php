<h2>Appointment Confirmed</h2>
<p>Your appointment is confirmed:</p>

<ul>
  <li>Doctor: {{ $appointment->doctor->first_name }} {{ $appointment->doctor->last_name }}</li>
  <li>Date: {{ $appointment->appointment_date }}</li>
  <li>Time: {{ $appointment->start_time }} - {{ $appointment->end_time }}</li>
</ul>
