# Complete User Accounts - Login Credentials

This document contains all login credentials for the School Command Center application.

## Default Password
**All accounts use the default password: `admin123`**

> Users can update their name, phone number, and other details from within the app after logging in.

## How to Create All Accounts

Run the comprehensive seeding script:

```bash
npm run seed:all
```

This will create:
- 1 CEO account
- 1 DEO account
- 1 DDEO account
- 16 AEO accounts
- 16 Headmaster accounts (one per school)
- 32 Teacher accounts (two per school)
- **Total: 67 user accounts**

---

## 1. CEO Account (1)

| Role | Name | Phone Number | Password | District |
|------|------|--------------|----------|----------|
| CEO | CEO - Chief Executive Officer | 03000000001 | admin123 | district-1 |

**Access Level:** Highest - can see and manage all data across the system

---

## 2. DEO Account (1)

| Role | Name | Phone Number | Password | District |
|------|------|--------------|----------|----------|
| DEO | DEO - District Education Officer | 03000000002 | admin123 | district-1 |

**Access Level:** District-wide access - can manage all schools, clusters, and staff in the district

---

## 3. DDEO Account (1)

| Role | Name | Phone Number | Password | District |
|------|------|--------------|----------|----------|
| DDEO | DDEO - Deputy District Education Officer | 03000000003 | admin123 | district-1 |

**Access Level:** Deputy district management - assists DEO with district oversight

---

## 4. AEO Accounts (16)

Assistant Education Officers - Each manages a specific cluster

| # | Name | Phone Number | Password | Area | Cluster |
|---|------|--------------|----------|------|---------|
| 1 | Abdul Mateen Mughal | 03001000001 | admin123 | Jhatha Hathial | cluster-1 |
| 2 | Abdullah Raheem | 03001000002 | admin123 | Chountra | cluster-2 |
| 3 | Amir Aqeel Shah | 03001000003 | admin123 | RWP Cantt | cluster-3 |
| 4 | Muhammad Asif Jabbar | 03001000004 | admin123 | Adjala | cluster-4 |
| 5 | Muhammad Atif Minhas | 03001000005 | admin123 | Chakri | cluster-5 |
| 6 | Atiqa Tariq | 03001000006 | admin123 | Saddar Beroni | cluster-6 |
| 7 | Malik Nadeem Sultan | 03001000007 | admin123 | Raika Maira | cluster-7 |
| 8 | Nighat Noreen | 03001000008 | admin123 | RWP Cantt | cluster-3 |
| 9 | Rabia Rauf | 03001000009 | admin123 | Lodhran | cluster-8 |
| 10 | Sania Naseem | 03001000010 | admin123 | Pir Wadhai | cluster-9 |
| 11 | Sheraz Hussain | 03001000011 | admin123 | Chaklala | cluster-10 |
| 12 | Tasneem Shehzadi | 03001000012 | admin123 | Adyala | cluster-11 |
| 13 | Tauqeer Akbar | 03001000013 | admin123 | Chauntra | cluster-2 |
| 14 | Waheed Ahmed Butt | 03001000014 | admin123 | Shakrial | cluster-12 |
| 15 | Waseem Ashraf | 03001000015 | admin123 | Pir Wadhai | cluster-9 |
| 16 | Saima Bibi | 03001000016 | admin123 | Test Markaz | cluster-13 |

**Access Level:** Cluster management - can manage schools and staff within their assigned cluster

---

## 5. Headmaster Accounts (16)

One headmaster per school

| # | Name | Phone Number | Password | School | EMIS Number |
|---|------|--------------|----------|--------|-------------|
| 1 | Headmaster - GGPS Chakra | 03002000001 | admin123 | GGPS Chakra | 37330227 |
| 2 | Headmaster - GGPS Carriage Factory | 03002000002 | admin123 | GGPS Carriage Factory | 37330433 |
| 3 | Headmaster - GES JAWA | 03002000003 | admin123 | GES JAWA | 37330130 |
| 4 | Headmaster - GGPS Dhok Munshi | 03002000004 | admin123 | GGPS Dhok Munshi | 37330322 |
| 5 | Headmaster - GBPS Dhoke Ziarat | 03002000005 | admin123 | GBPS Dhoke Ziarat | 37330209 |
| 6 | Headmaster - GPS MILLAT ISLAMIA | 03002000006 | admin123 | GPS MILLAT ISLAMIA | 37330172 |
| 7 | Headmaster - GGPS Westridge 1 | 03002000007 | admin123 | GGPS Westridge 1 | 37330598 |
| 8 | Headmaster - GPS DHAMIAL | 03002000008 | admin123 | GPS DHAMIAL | 37330317 |
| 9 | Headmaster - GGPS ARAZI SOHAL | 03002000009 | admin123 | GGPS ARAZI SOHAL | 37330172-A |
| 10 | Headmaster - GGES Pind Habtal | 03002000010 | admin123 | GGES Pind Habtal | 37330612 |
| 11 | Headmaster - GMPS Khabba Barala | 03002000011 | admin123 | GMPS Khabba Barala | 37330410 |
| 12 | Headmaster - GPS CHAK DENAL | 03002000012 | admin123 | GPS CHAK DENAL | 37330312 |
| 13 | Headmaster - GPS REHMATABAD | 03002000013 | admin123 | GPS REHMATABAD | 37330383 |
| 14 | Headmaster - GGES Anwar ul Islam Kamalabad | 03002000014 | admin123 | GGES Anwar ul Islam Kamalabad | 37330151 |
| 15 | Headmaster - GGES Kotha Kallan | 03002000015 | admin123 | GGES Kotha Kallan | 37330561 |
| 16 | Headmaster - GGPS RAIKA MAIRA | 03002000016 | admin123 | GGPS RAIKA MAIRA | 37330627 |

**Access Level:** School management - can manage their assigned school and teachers

---

## 6. Teacher Accounts (32)

Two teachers per school - Phone numbers: 03003000001 to 03003000032

| # | Name | Phone Number | Password | School |
|---|------|--------------|----------|--------|
| 1 | Teacher 1 - GGPS Chakra | 03003000001 | admin123 | GGPS Chakra |
| 2 | Teacher 2 - GGPS Chakra | 03003000002 | admin123 | GGPS Chakra |
| 3 | Teacher 1 - GGPS Carriage Factory | 03003000003 | admin123 | GGPS Carriage Factory |
| 4 | Teacher 2 - GGPS Carriage Factory | 03003000004 | admin123 | GGPS Carriage Factory |
| 5 | Teacher 1 - GES JAWA | 03003000005 | admin123 | GES JAWA |
| 6 | Teacher 2 - GES JAWA | 03003000006 | admin123 | GES JAWA |
| 7 | Teacher 1 - GGPS Dhok Munshi | 03003000007 | admin123 | GGPS Dhok Munshi |
| 8 | Teacher 2 - GGPS Dhok Munshi | 03003000008 | admin123 | GGPS Dhok Munshi |
| 9 | Teacher 1 - GBPS Dhoke Ziarat | 03003000009 | admin123 | GBPS Dhoke Ziarat |
| 10 | Teacher 2 - GBPS Dhoke Ziarat | 03003000010 | admin123 | GBPS Dhoke Ziarat |
| 11 | Teacher 1 - GPS MILLAT ISLAMIA | 03003000011 | admin123 | GPS MILLAT ISLAMIA |
| 12 | Teacher 2 - GPS MILLAT ISLAMIA | 03003000012 | admin123 | GPS MILLAT ISLAMIA |
| 13 | Teacher 1 - GGPS Westridge 1 | 03003000013 | admin123 | GGPS Westridge 1 |
| 14 | Teacher 2 - GGPS Westridge 1 | 03003000014 | admin123 | GGPS Westridge 1 |
| 15 | Teacher 1 - GPS DHAMIAL | 03003000015 | admin123 | GPS DHAMIAL |
| 16 | Teacher 2 - GPS DHAMIAL | 03003000016 | admin123 | GPS DHAMIAL |
| 17 | Teacher 1 - GGPS ARAZI SOHAL | 03003000017 | admin123 | GGPS ARAZI SOHAL |
| 18 | Teacher 2 - GGPS ARAZI SOHAL | 03003000018 | admin123 | GGPS ARAZI SOHAL |
| 19 | Teacher 1 - GGES Pind Habtal | 03003000019 | admin123 | GGES Pind Habtal |
| 20 | Teacher 2 - GGES Pind Habtal | 03003000020 | admin123 | GGES Pind Habtal |
| 21 | Teacher 1 - GMPS Khabba Barala | 03003000021 | admin123 | GMPS Khabba Barala |
| 22 | Teacher 2 - GMPS Khabba Barala | 03003000022 | admin123 | GMPS Khabba Barala |
| 23 | Teacher 1 - GPS CHAK DENAL | 03003000023 | admin123 | GPS CHAK DENAL |
| 24 | Teacher 2 - GPS CHAK DENAL | 03003000024 | admin123 | GPS CHAK DENAL |
| 25 | Teacher 1 - GPS REHMATABAD | 03003000025 | admin123 | GPS REHMATABAD |
| 26 | Teacher 2 - GPS REHMATABAD | 03003000026 | admin123 | GPS REHMATABAD |
| 27 | Teacher 1 - GGES Anwar ul Islam Kamalabad | 03003000027 | admin123 | GGES Anwar ul Islam Kamalabad |
| 28 | Teacher 2 - GGES Anwar ul Islam Kamalabad | 03003000028 | admin123 | GGES Anwar ul Islam Kamalabad |
| 29 | Teacher 1 - GGES Kotha Kallan | 03003000029 | admin123 | GGES Kotha Kallan |
| 30 | Teacher 2 - GGES Kotha Kallan | 03003000030 | admin123 | GGES Kotha Kallan |
| 31 | Teacher 1 - GGPS RAIKA MAIRA | 03003000031 | admin123 | GGPS RAIKA MAIRA |
| 32 | Teacher 2 - GGPS RAIKA MAIRA | 03003000032 | admin123 | GGPS RAIKA MAIRA |

**Access Level:** Basic - can submit data requests and manage their assigned tasks

---

## Quick Reference: Phone Number Pattern

| Role | Phone Range | Example |
|------|-------------|---------|
| CEO | 03000000001 | 03000000001 |
| DEO | 03000000002 | 03000000002 |
| DDEO | 03000000003 | 03000000003 |
| AEO | 03001000001-016 | 03001000001 |
| Headmaster | 03002000001-016 | 03002000001 |
| Teacher | 03003000001-032 | 03003000001 |

---

## Updating User Information

After logging in, users can update their information through the user management interface:
- Name
- Phone number
- Password
- Other profile details

**Note:** The seed script is idempotent - running it multiple times won't create duplicate accounts.

---

## Security Recommendations

1. **Change Default Password**: All users should change their password after first login
2. **Verify Assignments**: Ensure each user is assigned to the correct school/cluster/district
3. **Regular Audits**: Periodically review user accounts and permissions
4. **Deactivate Unused Accounts**: Remove or disable accounts for users who no longer need access
