// import React from 'react';
// import { Button } from '../../../../ui/button';
// import { Input } from '../../../../ui/input';
// import { Textarea } from '../../../../ui/textarea';
// import { useToast } from '../../../../ui/use-toast';
// import { User } from 'lucide-react';
// import { encrypt } from '../../../../../utils/encryption';
// import { Buffer } from 'buffer';
// import { useUserData } from '../../../../../integrations/supabase/hooks/useUserData';
// import { supabase } from '../../../../../integrations/supabase/supabase';

// interface ProfileProps {
//   profile: {
//     display_name: string;
//     email: string;
//     bio: string;
//   };
//   setProfile: React.Dispatch<
//     React.SetStateAction<{
//       display_name: string;
//       email: string;
//       bio: string;
//     }>
//   >;
//   currentUserId: string;
// }

// export const AccountProfile = ({
//   profile,
//   setProfile,
//   currentUserId,
// }: ProfileProps) => {
//   const { toast } = useToast();
//   const { data: userData } = useUserData(currentUserId);

//   const handleSaveProfile = async () => {
//     try {
//       // Update account settings first
//       const { error: accountError } = await supabase
//         .from('AccountSettings')
//         .upsert({
//           user_id: currentUserId,
//           bio: profile.bio,
//           subscription_plan: userData?.account?.subscription_plan || 'FREE',
//           updated_at: new Date().toISOString(),
//         });

//       if (accountError) throw accountError;

//       // Update encrypted user data if needed
//       if (
//         userData?.user &&
//         (profile.display_name !== userData.user.name ||
//           profile.email !== userData.user.email)
//       ) {
//         const key = Buffer.from(userData.user.encryption_key, 'hex');

//         // Encrypt name and email separately
//         const encryptedName = encrypt(profile.display_name, key);
//         const encryptedEmail = encrypt(profile.email, key);

//         const { error: userError } = await supabase
//           .from('User')
//           .update({
//             encrypted_name: encryptedName.encryptedData,
//             encrypted_email: encryptedEmail.encryptedData,
//             iv: encryptedName.iv,
//             tag: encryptedName.tag,
//             updated_at: new Date().toISOString(),
//           })
//           .eq('id', currentUserId);

//         if (userError) throw userError;
//       }

//       toast({
//         title: 'Profile updated',
//         description: 'Your profile has been saved successfully.',
//       });
//     } catch (error) {
//       console.error('Profile update error:', error);
//       toast({
//         title: 'Error saving profile',
//         description:
//           error instanceof Error ? error.message : 'An error occurred',
//         variant: 'destructive',
//       });
//     }
//   };

//   return (
//     <div className="bg-gradient-to-br from-white to-blue-50/30 p-8 rounded-2xl border border-blue-100/50 shadow-xl shadow-blue-100/20">
//       <div className="flex items-center gap-3 mb-8">
//         <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
//           <User className="w-6 h-6 text-white" />
//         </div>
//         <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
//           Profile Information
//         </h2>
//       </div>

//       <div className="space-y-6">
//         <div className="space-y-2">
//           <label
//             htmlFor="displayName"
//             className="block text-sm font-semibold text-gray-700"
//           >
//             Display Name
//           </label>
//           <Input
//             id="displayName"
//             value={profile.display_name}
//             onChange={(e) =>
//               setProfile((prev) => ({ ...prev, display_name: e.target.value }))
//             }
//             placeholder="Enter your display name"
//             className="max-w-md bg-white/50 backdrop-blur-sm border-blue-100 focus:border-blue-300 focus:ring-blue-200 transition-all rounded-xl px-4 py-2.5 hover:bg-white/70"
//           />
//         </div>

//         <div className="space-y-2">
//           <label
//             htmlFor="email"
//             className="block text-sm font-semibold text-gray-700"
//           >
//             Email
//           </label>
//           <Input
//             id="email"
//             type="email"
//             value={profile.email}
//             onChange={(e) =>
//               setProfile((prev) => ({ ...prev, email: e.target.value }))
//             }
//             placeholder="Enter your email"
//             className="max-w-md bg-white/50 backdrop-blur-sm border-blue-100 focus:border-blue-300 focus:ring-blue-200 transition-all rounded-xl px-4 py-2.5 hover:bg-white/70"
//           />
//         </div>

//         <div className="space-y-2">
//           <label
//             htmlFor="bio"
//             className="block text-sm font-semibold text-gray-700"
//           >
//             Bio
//           </label>
//           <Textarea
//             id="bio"
//             value={profile.bio}
//             onChange={(e) =>
//               setProfile((prev) => ({ ...prev, bio: e.target.value }))
//             }
//             placeholder="Tell us about yourself"
//             className="max-w-md min-h-[120px] bg-white/50 backdrop-blur-sm border-blue-100 focus:border-blue-300 focus:ring-blue-200 transition-all rounded-xl px-4 py-3 hover:bg-white/70 resize-none"
//           />
//           <p className="text-sm text-blue-600/70 mt-1">
//             Share a brief description about yourself
//           </p>
//         </div>

//         <Button
//           onClick={handleSaveProfile}
//           className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
//         >
//           Save Changes
//         </Button>
//       </div>
//     </div>
//   );
// };
