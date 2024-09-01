# DRONE-CITY

#Deploy hook
Your private URL to trigger a deploy for this server. Remember to keep this a secret.  https://api.render.com/deploy/srv-cr8qvs5svqrc739eph30?key=0DbPICcppJw


  https://drone-city-website.onrender.com/index.html 

  https://dashboard.render.com/

  https://drone-city-website.onrender.com

  https://drone-city.onrender.com

https://drone-city.onrender.com/html-data


# ![1](https://github.com/user-attachments/assets/080e34d8-3290-4632-82b9-ab89d184ff61)

-----------------
# Real-Time Data Monitoring API

Αυτό το API αναπτύχθηκε για να παρέχει δεδομένα αισθητήρων σε πραγματικό χρόνο από ένα Arduino και να τα παρουσιάζει σε διάφορες μορφές HTML rendering.

## Περιεχόμενα

- [Λειτουργίες](#λειτουργίες)
- [Οδηγίες Εγκατάστασης](#οδηγίες-εγκατάστασης)
- [Οδηγίες Χρήσης](#οδηγίες-χρήσης)
- [API Endpoints](#api-endpoints)

## Λειτουργίες

1. **Διαχείριση Δεδομένων μέσω HTTP**
   - Υποστηρίζει POST και GET αιτήσεις στο endpoint `/data` για αποστολή και ανάκτηση δεδομένων αισθητήρων.
2. **HTML Rendering**
   - Δυναμικά δημιουργημένη HTML σελίδα στο endpoint `/html-data`, που εμφανίζει τα τρέχοντα δεδομένα και ανανεώνεται αυτόματα κάθε 5 δευτερόλεπτα.
