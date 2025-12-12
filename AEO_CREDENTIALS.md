# AEO User Accounts

This document contains the login credentials for all 16 AEO (Assistant Education Officer) accounts.

## Default Password
All AEO accounts use the default password: **aeo123**

> **Note:** You mentioned you will be adding other details later. These accounts are created with basic information and can be updated through the admin panel.

## How to Create These Accounts

Run the following command to seed all AEO user accounts:

```bash
npm run seed:aeos
```

This script will:
- Check if each AEO account already exists (by phone number)
- Create new accounts only for AEOs that don't exist yet
- Display a summary of created accounts

## AEO Login Credentials

| # | Name | Phone Number (Username) | Password | Area | Gender | Cluster ID |
|---|------|------------------------|----------|------|--------|------------|
| 1 | Abdul Mateen Mughal | 03001000001 | aeo123 | Jhatha Hathial | Male | cluster-1 |
| 2 | Abdullah Raheem | 03001000002 | aeo123 | Chountra | Female | cluster-2 |
| 3 | Amir Aqeel Shah | 03001000003 | aeo123 | RWP Cantt | Male | cluster-3 |
| 4 | Muhammad Asif Jabbar | 03001000004 | aeo123 | Adjala | Male | cluster-4 |
| 5 | Muhammad Atif Minhas | 03001000005 | aeo123 | Chakri | Male | cluster-5 |
| 6 | Atiqa Tariq | 03001000006 | aeo123 | Saddar Beroni | Female | cluster-6 |
| 7 | Malik Nadeem Sultan | 03001000007 | aeo123 | Raika Maira | Female | cluster-7 |
| 8 | Nighat Noreen | 03001000008 | aeo123 | RWP Cantt | Female | cluster-3 |
| 9 | Rabia Rauf | 03001000009 | aeo123 | Lodhran | Female | cluster-8 |
| 10 | Sania Naseem | 03001000010 | aeo123 | Pir Wadhai | Female | cluster-9 |
| 11 | Sheraz Hussain | 03001000011 | aeo123 | Chaklala | Male | cluster-10 |
| 12 | Tasneem Shehzadi | 03001000012 | aeo123 | Adyala | Female | cluster-11 |
| 13 | Tauqeer Akbar | 03001000013 | aeo123 | Chauntra | Male | cluster-2 |
| 14 | Waheed Ahmed Butt | 03001000014 | aeo123 | Shakrial | Male | cluster-12 |
| 15 | Waseem Ashraf | 03001000015 | aeo123 | Pir Wadhai | Male | cluster-9 |
| 16 | Saima Bibi | 03001000016 | aeo123 | Test Markaz | Female | cluster-13 |

## Account Details

Each AEO account includes:
- **Name**: Full name of the AEO
- **Phone Number**: Used as the username for login (format: 03001000XXX)
- **Password**: Default password "aeo123" (should be changed by the user after first login)
- **Role**: AEO
- **Area**: Area of responsibility
- **Cluster ID**: Assigned cluster
- **District ID**: district-1 (all AEOs are in the same district for now)

## Login Instructions

1. Go to the login page
2. Enter the phone number (e.g., 03001000001)
3. Enter the password: aeo123
4. Click login

## Security Recommendations

1. **Change Default Passwords**: Users should change their passwords after first login
2. **Update User Information**: Add additional details through the admin panel as needed
3. **Review Cluster Assignments**: Verify that each AEO is assigned to the correct cluster

## Updating User Information

To update user information later:
1. Log in as an admin
2. Navigate to User Management
3. Search for the user by phone number or name
4. Edit the user details as needed

## Notes

- All phone numbers follow the pattern: 030010000XX (where XX is 01-16)
- Multiple AEOs can be assigned to the same cluster (e.g., cluster-2, cluster-3, cluster-9)
- Gender information is stored for reporting purposes
- The seed script is idempotent - running it multiple times won't create duplicate accounts
